import { Brick } from "./Brick";
import { ClassMeta } from "../lib/classes";

export function ConveyorLane({ meta, active }: { meta: ClassMeta; active: boolean }) {
  return (
    <div className={`rounded-card border bg-panel transition-colors ${active ? "border-brand/60 bg-raised" : "border-line"}`}
         style={{ borderLeft: `3px solid ${meta.color}` }}>
      <div className="grid items-center gap-5 p-5 lg:grid-cols-[220px_1fr_130px]">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-faint">{meta.lane}</p>
          <h3 className="mt-2 text-[22px] font-bold uppercase" style={{ color: meta.color }}>{meta.name} objects</h3>
          <p className="mt-1 text-[12px] text-muted">Destination: {meta.conveyor}</p>
          <span className={`mt-3 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] ${active ? "border-brand/40 bg-brand/15 text-brand" : "border-ok/30 bg-ok/10 text-ok"}`}>
            <i className="h-1.5 w-1.5 rounded-full bg-current" />{active ? "Selected route" : "Ready to route"}
          </span>
        </div>
        <div className="relative overflow-hidden rounded-full border border-line bg-app/70 py-3">
          <div className={`absolute inset-x-6 top-1/2 h-[calc(100%-16px)] -translate-y-1/2 rounded-full opacity-60 ${active ? "belt-moving" : ""}`}
               style={{ backgroundImage: "repeating-linear-gradient(90deg,#1c2a45 0 3px,transparent 3px 28px)" }} />
          <div className="relative flex items-center justify-around px-6">
            {[0, 1, 2].map((i) => <Brick key={i} color={meta.color} className="h-14 w-20" />)}
          </div>
        </div>
        <div className="flex items-center gap-4 lg:justify-end">
          <span className="text-faint">→</span>
          <div className={`grid h-24 w-28 place-items-center rounded-lg border bg-app/60 ${active ? "border-brand/60" : "border-line"}`}>
            <div className="text-center">
              <p className="text-[34px] font-bold leading-none" style={{ color: meta.color }}>{meta.letter}</p>
              <p className="mt-2 text-[9px] uppercase tracking-wider text-faint">Destination</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
