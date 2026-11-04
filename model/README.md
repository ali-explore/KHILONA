# Model folder

Place these files here (not included yet):

| File | Required | Notes |
|---|---|---|
| `khilona_model.keras` | yes | saved with `model.save("khilona_model.keras")` |
| `class_names.json` | yes | e.g. `["Blue", "Purple", "Yellow"]`, in the SAME order as the training labels |
| `model_config.json` | recommended | `{"image_size": [H, W], "color_mode": "RGB", "normalization": "rescale_255"}`; normalization is `rescale_255`, `minus1_1` or `none` (if the model has its own Rescaling layer) |
| `metrics.json` | optional | results for the Model Performance page (schema in the main README) |
