import { useEffect, useState } from "react";
import { LineChart } from "../components/LineChart";
import { Card, Notice, PageHeader, Pill } from "../components/ui";
import { getMetrics, Metrics } from "../lib/api";
import { CLASS_META, CLASS_ORDER } from "../lib/classes";
import { useApp } from "../lib/AppContext";

const pct = (v?: number) => (v == null ? "—" : `${(v * 100).toFixed(1)}%`);

function Score({ label, note, value }: { label: string; note: string; value?: number }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between"><p className="text-[13px]">{label}</p>{value == null && <span className="text-[10px] font-semibold uppercase tracking-wider text-brand">Pending</span>}</div>
      <p className="my-4 text-3xl font-semibold">{pct(value)}</p>
      <p className="text-[11px] text-faint">{note}</p>
    </Card>
  );
}
function ChartCard({ title, series, yLabel }: { title: string; yLabel: string; series: { label: string; color: string; values?: number[] }[] }) {
  const ok = series.every((s) => s.values && s.values.length > 0);
  return (
    <Card className="p-5">
      <h3 className="font-semibold">{title}</h3>
      <div className="mb-3 mt-2 flex gap-4 text-[10px] text-muted">{series.map((s) => <span key={s.label} className="flex items-center gap-1.5"><i className="h-[3px] w-3 rounded" style={{ background: s.color }} />{s.label}</span>)}</div>
      {ok ? <LineChart yLabel={yLabel} series={series.map((s) => ({ label: s.label, color: s.color, values: s.values! }))} />
        : <div className="grid h-[200px] place-items-center rounded-lg border border-dashed border-line text-center text-[12px] text-muted"><div><p className="text-ink">Training history not imported</p><p className="mt-1 text-faint">No sample curves shown</p></div></div>}
    </Card>
  );
}

export default function Performance() {
  const { backendOnline } = useApp();
  const [m, setM] = useState<Metrics | null>(null);
  useEffect(() => { getMetrics().then(setM).catch(() => setM(null)); }, [backendOnline]);
  const have = !!m?.available;
  const order = (have && m?.class_order) || CLASS_ORDER;
  const cm = have ? m?.confusion_matrix : undefined;

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader eyebrow="Model evaluation" title="Model Performance" subtitle="A transparent view of CNN training, validation and test evaluation." />
      {have
        ? <Notice label="Training results loaded">Values below come from model/metrics.json exported by the training notebook.</Notice>
        : <Notice label="Awaiting notebook results">{m?.error ?? "All evaluation values are placeholders. No performance claims are made."}</Notice>}
      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <Score label="Test accuracy" note="Held-out test set" value={have ? m?.test_accuracy : undefined} />
        <Score label="Training accuracy" note="Final training epoch" value={have ? m?.train_accuracy : undefined} />
        <Score label="Validation accuracy" note="Final validation epoch" value={have ? m?.val_accuracy : undefined} />
      </div>
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Training & validation accuracy" yLabel="Accuracy" series={[{ label: "Training", color: "#3b82f6", values: m?.history?.accuracy }, { label: "Validation", color: "#a855f7", values: m?.history?.val_accuracy }]} />
        <ChartCard title="Training & validation loss" yLabel="Loss" series={[{ label: "Training", color: "#3b82f6", values: m?.history?.loss }, { label: "Validation", color: "#a855f7", values: m?.history?.val_loss }]} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card className="p-5">
          <h3 className="mb-4 font-semibold">Confusion matrix</h3>
          <p className="mb-2 text-center text-[9px] uppercase tracking-wider text-faint">Predicted class</p>
          <div className="grid grid-cols-[auto_repeat(3,1fr)] items-center gap-2 text-[11px]">
            <span />{order.map((c) => <span key={c} className="text-center" style={{ color: CLASS_META[c as keyof typeof CLASS_META]?.color }}>{c}</span>)}
            {order.map((r, i) => (
              <div key={r} className="contents">
                <span style={{ color: CLASS_META[r as keyof typeof CLASS_META]?.color }}>{r}</span>
                {order.map((c, j) => (
                  <span key={c} className={`grid h-12 place-items-center rounded-md ${i === j ? "bg-brand/25" : "bg-raised"} ${cm ? "text-ink" : "text-faint"}`}>{cm?.[i]?.[j] ?? "—"}</span>
                ))}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-faint">Actual class {cm ? "" : "· counts awaiting test predictions"}</p>
        </Card>
        <Card className="overflow-x-auto p-5">
          <div className="mb-1 flex items-center justify-between"><h3 className="font-semibold">Classification report</h3>{!have && <Pill>Pending</Pill>}</div>
          <p className="mb-4 text-[11px] text-muted">Precision, recall and F1 on the held-out test set.</p>
          <table className="w-full min-w-[420px] text-[12px]">
            <thead><tr className="border-b border-line text-left text-[11px] text-muted">{["Class", "Precision", "Recall", "F1-score", "Support"].map((h, i) => <th key={h} className={`pb-3 font-normal ${i ? "text-center" : ""}`}>{h}</th>)}</tr></thead>
            <tbody>
              {CLASS_ORDER.map((c) => {
                const r = have ? m?.classification_report?.[c] : undefined;
                const f1 = r?.f1_score ?? r?.["f1-score"];
                const cell = (v?: number, f = (x: number) => x.toFixed(2)) => (v == null ? "—" : f(v));
                return (
                  <tr key={c} className="border-b border-line/60 last:border-0">
                    <td className="flex items-center gap-2 py-3"><i className="h-1.5 w-1.5 rounded-full" style={{ background: CLASS_META[c].color }} />{c}</td>
                    <td className="text-center">{cell(r?.precision)}</td><td className="text-center">{cell(r?.recall)}</td>
                    <td className="text-center">{cell(f1)}</td><td className="text-center">{cell(r?.support, String)}</td>
                  </tr>);
              })}
            </tbody>
          </table>
          {!have && <p className="mt-4 text-[11px] text-faint">Import the training notebook results to populate this evaluation.</p>}
        </Card>
      </div>
    </div>
  );
}
