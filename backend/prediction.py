"""Model loading and inference. Independent from the web layer.

Nothing in here fabricates results: if the model or class names are missing,
`predict` raises ModelUnavailableError and the API answers 503.
"""
from __future__ import annotations

import io
import json
import logging
import os
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, UnidentifiedImageError

log = logging.getLogger("khilona.prediction")

# Resolve model directory:
# 1. MODEL_DIR environment variable if specified
# 2. Sibling model/ directory relative to backend (standard repository root)
# 3. model/ directory in current working directory
# 4. model/ directory inside backend/
_env_model_dir = os.getenv("MODEL_DIR", "").strip()
if _env_model_dir:
    MODEL_DIR = Path(_env_model_dir).resolve()
else:
    _repo_model_dir = Path(__file__).resolve().parent.parent / "model"
    _cwd_model_dir = Path.cwd() / "model"
    _local_model_dir = Path(__file__).resolve().parent / "model"
    if _repo_model_dir.exists():
        MODEL_DIR = _repo_model_dir
    elif _cwd_model_dir.exists():
        MODEL_DIR = _cwd_model_dir
    elif _local_model_dir.exists():
        MODEL_DIR = _local_model_dir
    else:
        MODEL_DIR = _repo_model_dir

MODEL_PATH = MODEL_DIR / "khilona_model.keras"
CLASS_NAMES_PATH = MODEL_DIR / "class_names.json"
CONFIG_PATH = MODEL_DIR / "model_config.json"   # optional
METRICS_PATH = MODEL_DIR / "metrics.json"       # optional

# Class -> conveyor routing (dictionary lookup, no if/else chains).
CLASS_TO_CONVEYOR: dict[str, str] = {
    "Blue": "Conveyor Belt A",
    "Yellow": "Conveyor Belt B",
    "Purple": "Conveyor Belt C",
}

# Normalisation modes. Must match what was used in training.
NORMALIZERS = {
    "rescale_255": lambda a: a / 255.0,
    "minus1_1": lambda a: a / 127.5 - 1.0,
    "none": lambda a: a,  # use when the saved model contains its own Rescaling layer
}

DEFAULT_CONFIG: dict[str, Any] = {
    "image_size": [224, 224],      # [height, width]
    "color_mode": "RGB",
    "normalization": "rescale_255",
}

ALLOWED_TYPES = {"image/jpeg", "image/png"}


class ModelUnavailableError(RuntimeError):
    pass


class InvalidImageError(ValueError):
    pass


class Predictor:
    def __init__(self) -> None:
        self.model = None
        self.class_names: list[str] = []
        self.config: dict[str, Any] = dict(DEFAULT_CONFIG)
        self.error: str | None = None
        self.load()

    def load(self) -> None:
        self.model, self.class_names, self.error = None, [], None
        if not MODEL_PATH.exists():
            self.error = f"Model file not found: model/{MODEL_PATH.name}"
            return
        if not CLASS_NAMES_PATH.exists():
            self.error = f"Class names not found: model/{CLASS_NAMES_PATH.name}"
            return
        try:
            names = json.loads(CLASS_NAMES_PATH.read_text(encoding="utf-8"))
            if CONFIG_PATH.exists():
                self.config.update(json.loads(CONFIG_PATH.read_text(encoding="utf-8")))
            if self.config["normalization"] not in NORMALIZERS:
                raise ValueError(f"Unknown normalization '{self.config['normalization']}'")
            import tensorflow as tf  # lazy: the API starts even without TensorFlow

            self.model = tf.keras.models.load_model(MODEL_PATH)
            self.class_names = [str(n).strip().title() for n in names]
            unmapped = [n for n in self.class_names if n not in CLASS_TO_CONVEYOR]
            if unmapped:
                raise ValueError(f"No conveyor mapping for classes: {unmapped}")
            log.info("Model loaded with classes %s", self.class_names)
        except Exception as exc:  # noqa: BLE001
            self.model, self.class_names = None, []
            self.error = f"Model could not be loaded: {exc}"
            log.exception("Model load failed")

    @property
    def ready(self) -> bool:
        return self.model is not None

    def _preprocess(self, data: bytes) -> np.ndarray:
        try:
            img = Image.open(io.BytesIO(data))
            img.load()
        except (UnidentifiedImageError, OSError) as exc:
            raise InvalidImageError("File is not a readable image.") from exc
        img = img.convert(self.config["color_mode"])
        h, w = self.config["image_size"]
        img = img.resize((w, h), Image.BILINEAR)
        arr = np.asarray(img, dtype="float32")
        arr = NORMALIZERS[self.config["normalization"]](arr)
        return np.expand_dims(arr, 0)

    def predict(self, data: bytes) -> dict[str, Any]:
        if not self.ready:
            raise ModelUnavailableError(self.error or "Model is not loaded.")
        batch = self._preprocess(data)
        probs = np.asarray(self.model.predict(batch, verbose=0))[0]
        if len(probs) != len(self.class_names):
            raise ModelUnavailableError("Model output size does not match class_names.json.")
        idx = int(np.argmax(probs))
        label = self.class_names[idx]
        return {
            "predicted_class": label,
            "confidence": float(probs[idx]),
            "probabilities": {n: float(p) for n, p in zip(self.class_names, probs)},
            "conveyor": CLASS_TO_CONVEYOR[label],
        }


def load_metrics() -> dict[str, Any]:
    """Metrics exported from the training notebook, or an 'unavailable' marker."""
    if not METRICS_PATH.exists():
        return {"available": False}
    try:
        return {"available": True, **json.loads(METRICS_PATH.read_text(encoding="utf-8"))}
    except (OSError, json.JSONDecodeError):
        return {"available": False, "error": "metrics.json is not valid JSON."}
