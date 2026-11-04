interface Series { label: string; color: string; values: number[] }

/** Minimal SVG line chart. Renders only the data it receives. */
export function LineChart({ series, yLabel }: { series: Series[]; yLabel: string }) {
  const W = 520, H = 220, P = { l: 44, r: 12, t: 12, b: 28 };
  const all = series.flatMap((s) => s.values);
  const n = Math.max(...series.map((s) => s.values.length));
  const min = Math.min(...all), max = Math.max(...all);
  const pad = (max - min || 1) * 0.08;
  const lo = min - pad, hi = max + pad;
  const x = (i: number) => P.l + (n <= 1 ? 0 : (i / (n - 1)) * (W - P.l - P.r));
  const y = (v: number) => P.t + (1 - (v - lo) / (hi - lo)) * (H - P.t - P.b);
  const ticks = [0, 1, 2, 3].map((k) => lo + ((hi - lo) * k) / 3);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={yLabel}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="#1c2a45" />
          <text x={P.l - 6} y={y(t) + 3} textAnchor="end" fontSize="9" fill="#7f8ca8">{t.toFixed(2)}</text>
        </g>
      ))}
      {series.map((s) => (
        <polyline key={s.label} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round"
          points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
      ))}
      <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="#7f8ca8">Epoch ({n})</text>
    </svg>
  );
}
