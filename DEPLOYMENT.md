# KHILONA Deployment Guide: Vercel & Render (Free Tiers)

This guide walks you through deploying the **KHILONA Smart Object Sorting System** using:
- **Render (Free Tier)** for the FastAPI + TensorFlow CNN backend.
- **Vercel (Hobby Free Tier)** for the React + Vite frontend.

---

## Architecture Overview

```
┌─────────────────────────────────┐          ┌──────────────────────────────────┐
│   Vercel (Hobby Free Tier)      │          │     Render (Free Web Service)    │
│                                 │          │                                  │
│   React + Vite Frontend (SPA)   │          │   FastAPI + Uvicorn ($PORT)      │
│   Base URL:                     │  HTTPS   │   Allowed CORS: FRONTEND_ORIGIN  │
│   VITE_API_BASE_URL ────────────┼─────────►│                                  │
│                                 │  REST    │   ├── /api/health                │
│   • Camera / Image Upload       │          │   ├── /api/predict               │
│   • Conveyor Belt UI (A/B/C)    │          │   └── /api/metrics               │
│   • Metrics Dashboard           │          │                                  │
│                                 │          │   └── model/khilona_model.keras  │
└─────────────────────────────────┘          └──────────────────────────────────┘
```

---

## Step 1: Push Code & Model to GitHub

Render and Vercel deploy directly from your Git repository (GitHub or GitLab).

1. Open your terminal in the `khilona` project root.
2. Initialize git if you haven't already:
   ```bash
   git init
   git branch -M main
   ```
3. Verify that `.gitignore` tracks the trained model while ignoring raw dataset files:
   - `model/khilona_model.keras` (~2.9 MB) **will be committed**.
   - Raw datasets (`dataset/`, `data/`, `*.zip`) are ignored to keep the repository lightweight.
4. Stage and commit your files:
   ```bash
   git add .
   git commit -m "Configure KHILONA for Render and Vercel deployment"
   ```
5. Create a new repository on [GitHub](https://github.com/new) and push your code:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

---

## Step 2: Deploy Backend to Render

### Option A: Using Render Blueprint (`render.yaml`) — Automated Setup
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository.
4. Render detects `render.yaml` at the root and configures:
   - **Service Name**: `khilona-backend`
   - **Runtime**: `Python 3`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
   - **Health Check Path**: `/api/health`
5. Click **Apply**. Render will build and deploy the web service.

---

### Option B: Manual Web Service Setup via Render Dashboard
If you prefer configuring via the web interface:
1. Log in to [Render](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Enter the following settings:
   - **Name**: `khilona-backend`
   - **Region**: Choose the region closest to you (e.g., `Oregon (US West)`, `Frankfurt (EU)`, or `Singapore`).
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free` (0.1 CPU, 512 MB RAM)
5. Expand **Advanced** -> **Add Environment Variable**:
   | Key | Value | Purpose |
   |---|---|---|
   | `PYTHON_VERSION` | `3.11.9` | Ensures Python 3.11 is used for stable TensorFlow 2.16+ installation |
   | `FRONTEND_ORIGIN` | `https://localhost:5173` *(update after Step 3)* | Allowed CORS origin for frontend |
6. Set **Health Check Path** to:
   ```
   /api/health
   ```
7. Click **Create Web Service**.

Wait 3–5 minutes for the build to finish. Once deployed, Render provides a public URL such as:
`https://khilona-backend.onrender.com`

---

## Step 3: Deploy Frontend to Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New…** -> **Project**.
3. Import your `khilona` GitHub repository.
4. In the **Configure Project** screen:
   - **Project Name**: `khilona` (or custom name)
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `frontend`. *(Crucial: tell Vercel the React code lives in `frontend`)*
   - **Build and Output Settings**:
     - Build Command: `npm run build` (default)
     - Output Directory: `dist` (default)
     - Install Command: `npm install` (default)
5. Expand **Environment Variables**:
   | Name | Value | Description |
   |---|---|---|
   | `VITE_API_BASE_URL` | `https://khilona-backend.onrender.com` | Your Render backend public URL from Step 2 |
6. Click **Deploy**.

Vercel will build the frontend and provide your live URL, such as:
`https://khilona.vercel.app`

---

## Step 4: Link Frontend & Backend (CORS Finalization)

Now connect the backend CORS whitelist to your live Vercel URL:

1. Open your [Render Dashboard](https://dashboard.render.com).
2. Navigate to your `khilona-backend` service -> **Environment**.
3. Update `FRONTEND_ORIGIN` to your Vercel production domain:
   ```env
   FRONTEND_ORIGIN=https://khilona.vercel.app
   ```
   *(If you also test from custom preview domains or localhost, separate them with commas)*.
4. Click **Save Changes**. Render will automatically redeploy the service with updated CORS rules.

---

## Step 5: Verification Checklist

Before considering deployment complete, run these two checks:

### 1. Test Hosted Health Endpoint
In your browser or terminal, check the live backend:
```bash
curl https://<your-render-url>.onrender.com/api/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "model_loaded": true,
  "classes": ["Blue", "Purple", "Yellow"],
  "detail": null
}
```
Also check metrics:
```bash
curl https://<your-render-url>.onrender.com/api/metrics
```

### 2. Test Real Image Prediction
Submit an image to the live hosted backend:
```bash
curl -X POST -F "file=@sample_toy.jpg" https://<your-render-url>.onrender.com/api/predict
```
**Expected Response:**
```json
{
  "predicted_class": "Blue",
  "confidence": 0.99,
  "probabilities": {
    "Blue": 0.99,
    "Purple": 0.005,
    "Yellow": 0.005
  },
  "conveyor": "Conveyor Belt A"
}
```

### 3. Test Through the Deployed Vercel Web UI
1. Visit `https://<your-vercel-app>.vercel.app`.
2. Confirm the header shows the backend is **Online** and model is **Connected**.
3. Go to **Detection**:
   - Capture via Webcam or upload a physical object photo.
   - Click **Analyze & Sort**.
4. Confirm sorting animation routes to the designated conveyor belt.
5. Check **Model Performance** to verify metrics and confusion matrix render properly.

---

## Free-Tier Limitations & Operational Tips

### 1. Render Cold Starts (Spin-Down)
- **Behavior**: On Render's Free tier, the web service automatically spins down after 15 minutes of inactivity.
- **Wake-up Delay**: The next incoming request will wake the container. Because TensorFlow initialization and loading the Keras model takes 15–20 seconds, the first request may take **30 to 50 seconds** to respond.
- **Handling in KHILONA**:
  - The frontend polls health status every 10 seconds. During a cold start, wait ~45 seconds for the server to wake up; the UI badge will flip from "Offline" to "System Ready".
  - If you need 100% immediate responsiveness with no cold starts, upgrade Render to the Starter tier ($7/month).

### 2. Memory Limitations (512 MB RAM)
- **Constraint**: Render Free tier provides **512 MB of RAM**.
- **KHILONA Profile**:
  - Baseline Python + FastAPI: ~18 MB
  - TensorFlow runtime: ~360 MB
  - Loaded `khilona_model.keras`: ~383 MB RSS
- **Recommendation**:
  - Always run a single Uvicorn worker (which is default: `--workers 1`). Do not spawn multiple workers on free tier.
  - If you encounter memory limits (Render error code `137` / Out of Memory), replace `tensorflow>=2.16` in `requirements.txt` with `tensorflow-cpu>=2.16`. This removes unused GPU/CUDA shared libraries and saves ~80–120 MB of disk/RAM overhead.

### 3. Render Monthly Active Hours
- Render free tier accounts receive 750 free instance hours per month, which is enough to run one service continuously for an entire 31-day month when it spins down when idle.

### 4. Camera & HTTPS Requirements
- Browsers only permit webcam access (`navigator.mediaDevices.getUserMedia`) on `localhost` or over secure `https://`.
- Vercel provides automatic SSL certificates, so the webcam detection page works seamlessly in production.

