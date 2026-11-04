import { ConveyorLane } from "../components/ConveyorLane";
import { Notice, PageHeader } from "../components/ui";
import { CLASS_META, CLASS_ORDER, isClassName } from "../lib/classes";
import { useApp } from "../lib/AppContext";

export default function Conveyor() {
  const { lastResult } = useApp();
  const active = lastResult && isClassName(lastResult.predicted_class) ? lastResult.predicted_class : null;
  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader eyebrow="Routing simulation" title="Conveyor System" subtitle="A software simulation of intelligent color-based conveyor routing." />
      <Notice label="Simulation only">Routing is visualized in software. No physical conveyor hardware is connected.</Notice>
      {active && (
        <p className="mb-4 text-[13px] text-muted" role="status">
          Latest prediction: <b style={{ color: CLASS_META[active].color }}>{active}</b> → {CLASS_META[active].conveyor}
        </p>
      )}
      <div className="space-y-4">
        {CLASS_ORDER.map((c) => <ConveyorLane key={c} meta={CLASS_META[c]} active={active === c} />)}
      </div>
      <p className="mt-6 flex flex-wrap gap-x-6 text-[12px] text-muted"><span className="eyebrow">Routing logic</span>Image color → CNN prediction → Assigned conveyor destination</p>
    </div>
  );
}
