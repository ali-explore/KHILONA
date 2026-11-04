/** Isometric plastic brick (matches the Figma illustrations). */
export function Brick({ color, className = "" }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 90" className={className} aria-hidden="true">
      <defs>
        <filter id="b" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity=".3" /></filter>
      </defs>
      <g filter="url(#b)">
        <polygon points="60,32 110,50 60,68 10,50" fill={color} />
        <polygon points="10,50 60,68 60,86 10,68" fill={color} />
        <polygon points="60,68 110,50 110,68 60,86" fill={color} />
      </g>
      <polygon points="10,50 60,68 60,86 10,68" fill="#000" opacity=".28" />
      <polygon points="60,68 110,50 110,68 60,86" fill="#000" opacity=".12" />
      <polygon points="60,32 110,50 60,68 10,50" fill="#fff" opacity=".08" />
      {[[42, 46], [74, 46], [58, 56]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 9} y={y - 12} width="18" height="12" fill={color} />
          <rect x={x - 9} y={y - 12} width="9" height="12" fill="#000" opacity=".2" />
          <ellipse cx={x} cy={y - 12} rx="9" ry="4.5" fill={color} />
          <ellipse cx={x} cy={y - 12} rx="9" ry="4.5" fill="#fff" opacity=".18" />
        </g>
      ))}
    </svg>
  );
}
