import { Link } from "react-router-dom";
import { ArrowRight, Cpu } from "lucide-react";
import { Brick } from "../components/Brick";
import { Card, PageHeader, Pill } from "../components/ui";
import { CLASS_META, CLASS_ORDER } from "../lib/classes";
import { useApp } from "../lib/AppContext";
import { useEffect, useState } from "react";
import { getMetrics, Metrics } from "../lib/api";

function Stat({ label, value, note, valueClass = "" }: { label: string; value: string; note: string; valueClass?: string }) {
  return (
    <Card className="p-5">
      <p className="text-[12px] text-muted">{label}</p>
      <p className={`my-3 text-[32px] font-semibold leading-none ${valueClass}`}>{value}</p>
      <p className="text-[11px] text-faint">{note}</p>
    </Card>
  );
}

export default function Overview() {
  const { backendOnline, modelLoaded, analyzedCount } = useApp();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  useEffect(() => { if (backendOnline) getMetrics().then(setMetrics).catch(() => setMetrics(null)); }, [backendOnline]);
  const acc = metrics?.available && metrics.test_accuracy != null ? `${(metrics.test_accuracy * 100).toFixed(1)}%` : "—";
  const ready = modelLoaded;

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader eyebrow="Operations overview" title="Smart Sorting Control Center"
        subtitle="AI-powered plastic object identification and automated conveyor routing." />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total Classes" value="03" note="Blue · Yellow · Purple" />
        <Stat label="Model Accuracy" value={acc} note={acc === "—" ? "Awaiting test evaluation" : "Held-out test set"} />
        <Stat label="Objects Analyzed" value={analyzedCount ? String(analyzedCount) : "—"} note={analyzedCount ? "This browser session" : "Live counter not connected"} />
        <Stat label="System Status" value={ready ? "Ready" : backendOnline ? "Model offline" : "Ready"}
          valueClass={ready || !backendOnline ? "text-ok" : "text-yellow"}
          note={ready ? "Workspace ready · model connected" : "Workspace ready · model offline"} />
      </div>

      <Card className="mb-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-semibold">From object to destination</h2>
            <p className="mt-1 text-[12px] text-muted">A single image. Three precise routes.</p>
          </div>
          <Pill tone="blue">Software simulation</Pill>
        </div>
        <div className="mt-6 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1.25fr]">
          <div className="flex flex-col items-center justify-between rounded-card border border-line bg-app/60 p-5 text-center grid-surface">
            <Brick color="#3b82f6" className="h-28 w-36" />
            <div><p className="font-semibold">Plastic object image</p><p className="mt-1 text-[11px] text-muted">Upload or capture</p></div>
          </div>
          <ArrowRight className="mx-auto self-center rotate-90 text-faint lg:rotate-0" size={18} />
          <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-brand/30 bg-raised p-5 text-center">
            <Cpu size={44} strokeWidth={1.2} className="text-brand" />
            <p className="font-semibold">Custom-trained CNN</p>
            <p className="text-[11px] text-muted">Color classification</p>
            <div className="flex gap-2">{CLASS_ORDER.map((c) => <i key={c} className="h-[3px] w-7 rounded" style={{ background: CLASS_META[c].color }} />)}</div>
          </div>
          <ArrowRight className="mx-auto self-center rotate-90 text-faint lg:rotate-0" size={18} />
          <div className="space-y-3 rounded-card border border-line bg-app/60 p-4">
            {CLASS_ORDER.map((c) => (
              <div key={c} className="flex items-center justify-between rounded-lg border border-line bg-panel/80 py-2 pl-4 pr-3" style={{ borderLeft: `3px solid ${CLASS_META[c].color}` }}>
                <div><p className="text-[9px] uppercase tracking-wider" style={{ color: CLASS_META[c].color }}>{c}</p><p className="text-[13px] font-semibold">{CLASS_META[c].conveyor}</p></div>
                <Brick color={CLASS_META[c].color} className="h-10 w-14" />
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-[11px] text-faint">Illustrative routing diagram · no live detections or physical conveyor connection</p>
      </Card>

      <Card className="flex flex-col items-start justify-between gap-4 bg-raised p-5 sm:flex-row sm:items-center">
        <div><p className="font-semibold">Your next object starts here.</p><p className="mt-1 text-[12px] text-muted">Connect the model, then upload an image to begin.</p></div>
        <Link to="/detection" className="inline-flex items-center gap-8 rounded-lg bg-brand px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-blue-400">Identify object <ArrowRight size={15} /></Link>
      </Card>
    </div>
  );
}
