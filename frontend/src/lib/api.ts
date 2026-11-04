export interface Health { status: string; model_loaded: boolean; classes: string[]; detail: string | null }
export interface Prediction {
  predicted_class: string;
  confidence: number;
  probabilities: Record<string, number>;
  conveyor: string;
}
export interface ReportRow { precision: number; recall: number; f1_score?: number; "f1-score"?: number; support: number }
export interface Metrics {
  available: boolean;
  error?: string;
  test_accuracy?: number;
  train_accuracy?: number;
  val_accuracy?: number;
  history?: { accuracy?: number[]; val_accuracy?: number[]; loss?: number[]; val_loss?: number[] };
  class_order?: string[];
  confusion_matrix?: number[][]; // rows = actual, columns = predicted (class_order)
  classification_report?: Record<string, ReportRow>;
}

export class ApiError extends Error {
  constructor(message: string, public kind: "offline" | "model" | "request", public status?: number) {
    super(message);
  }
}

// Compute the base URL for API requests.
// When VITE_API_BASE_URL is set (e.g. "https://khilona-backend.onrender.com"), requests go to that backend.
// When it is not set, fallback to "/api" which preserves the existing Vite local proxy behavior.
const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/+$/, "");
const API_BASE_URL = rawBaseUrl
  ? (rawBaseUrl.endsWith("/api") ? rawBaseUrl : `${rawBaseUrl}/api`)
  : "/api";

const isDeployed = Boolean(rawBaseUrl);

async function request<T>(path: string, init?: RequestInit, timeoutMs = 15000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let res: Response;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const targetUrl = `${API_BASE_URL}${normalizedPath}`;
  try {
    res = await fetch(targetUrl, { ...init, signal: ctrl.signal });
  } catch {
    throw new ApiError("Cannot reach the KHILONA backend. Start it and try again.", "offline");
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    let detail = `Request failed (${res.status}).`;
    try { detail = (await res.json()).detail ?? detail; } catch { /* non-JSON error body */ }
    // A dev proxy with no backend answers 5xx with an empty body.
    if (res.status >= 502 && res.status <= 504) throw new ApiError("Cannot reach the KHILONA backend. Start it and try again.", "offline", res.status);
    throw new ApiError(detail, res.status === 503 ? "model" : "request", res.status);
  }
  return res.json() as Promise<T>;
}

export const getHealth = () => request<Health>("/health", undefined, isDeployed ? 15000 : 4000);
export const getMetrics = () => request<Metrics>("/metrics", undefined, isDeployed ? 15000 : 6000);
export function predictImage(file: File) {
  const body = new FormData();
  body.append("file", file);
  return request<Prediction>("/predict", { method: "POST", body }, 60000);
}
