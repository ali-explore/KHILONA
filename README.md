# KHILONA — Smart Object Sorting System

React + Vite + Tailwind frontend and a FastAPI backend that will serve a custom Keras CNN
(Blue → Conveyor Belt A, Yellow → Belt B, Purple → Belt C). No model is bundled and nothing is
simulated: until the model files exist, the UI shows "Model not connected" and `/api/predict` returns 503.

```
khilona/
├─ backend/   app.py · prediction.py · requirements.txt
├─ model/     khilona_model.keras · class_names.json · model_config.json · metrics.json   (you provide)
└─ frontend/  Vite + React + TypeScript + Tailwind
```

## Run on Windows (PowerShell)

Prerequisites: Python 3.10–3.12, Node.js 18+.

**Backend**
```powershell
cd khilona\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```
Without a model the API still starts. Check http://127.0.0.1:8000/api/health
(`model_loaded: false`). If you don't want to install TensorFlow yet, remove that line from
requirements.txt; it is only imported when the model files are present.

**Frontend** (second terminal)
```powershell
cd khilona\frontend
npm install
npm run dev
```
Open http://localhost:5173. Vite proxies `/api` to port 8000. If the backend is stopped, the app
keeps working and shows "Backend offline".

## API
| Endpoint | Purpose |
|---|---|
| `GET /api/health` | `{status, model_loaded, classes, detail}` |
| `POST /api/predict` | multipart field `file` (JPG/PNG, ≤10 MB) → `{predicted_class, confidence, probabilities, conveyor}`; 503 if no model |
| `GET /api/metrics` | contents of `model/metrics.json` plus `available: true`, else `{available: false}` |

Routing lives in `CLASS_TO_CONVEYOR` (backend/prediction.py), mirrored in `frontend/src/lib/classes.ts`.

## Plugging in the trained model
Put these in `model/` and restart uvicorn:
1. `khilona_model.keras`
2. `class_names.json` — in training label order, e.g. `["Blue","Purple","Yellow"]`
3. `model_config.json` — must match training preprocessing:
   `{"image_size": [224, 224], "color_mode": "RGB", "normalization": "rescale_255"}`
   (`normalization`: `rescale_255` | `minus1_1` | `none` if the model already contains a Rescaling layer)
4. Optional `metrics.json` for the Model Performance page:
```json
{
  "test_accuracy": 0.0, "train_accuracy": 0.0, "val_accuracy": 0.0,
  "history": {"accuracy": [], "val_accuracy": [], "loss": [], "val_loss": []},
  "class_order": ["Blue", "Yellow", "Purple"],
  "confusion_matrix": [[0,0,0],[0,0,0],[0,0,0]],
  "classification_report": {"Blue": {"precision": 0, "recall": 0, "f1_score": 0, "support": 0}}
}
```
(`confusion_matrix`: rows = actual, columns = predicted, in `class_order`. Values above are schema placeholders.)

## Deployment (Vercel + Render)
See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions on deploying the backend to Render and the frontend to Vercel on free tiers.

## Notes
- Camera capture needs `localhost` or HTTPS and browser permission.
- "Objects analyzed" counts completed analyses in the current browser session only.
