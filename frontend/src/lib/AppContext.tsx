import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { getHealth, Health, Prediction } from "./api";

interface AppState {
  backendOnline: boolean;
  modelLoaded: boolean;
  health: Health | null;
  lastResult: Prediction | null;
  analyzedCount: number; // analyses completed in this browser session
  recordResult: (p: Prediction | null) => void;
  refreshHealth: () => void;
}
const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [health, setHealth] = useState<Health | null>(null);
  const [lastResult, setLastResult] = useState<Prediction | null>(null);
  const [analyzedCount, setCount] = useState(0);

  const refreshHealth = useCallback(() => {
    getHealth().then(setHealth).catch(() => setHealth(null));
  }, []);
  useEffect(() => {
    refreshHealth();
    const id = setInterval(refreshHealth, 10000);
    return () => clearInterval(id);
  }, [refreshHealth]);

  const recordResult = useCallback((p: Prediction | null) => {
    setLastResult(p);
    if (p) setCount((c) => c + 1);
  }, []);

  const value = useMemo<AppState>(() => ({
    backendOnline: health !== null,
    modelLoaded: !!health?.model_loaded,
    health, lastResult, analyzedCount, recordResult, refreshHealth,
  }), [health, lastResult, analyzedCount, recordResult, refreshHealth]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}
