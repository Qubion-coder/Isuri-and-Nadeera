import React, { useId } from 'react';

/* ------------------------------------------------------------------ */
/*  Lotus building blocks (inline SVG so they stay sharp everywhere)   */
/* ------------------------------------------------------------------ */

const petalPath = (len: number, w: number) =>
  `M0 0 C ${-w} ${-len * 0.3}, ${-w * 0.85} ${-len * 0.78}, 0 ${-len} C ${w * 0.85} ${-len * 0.78}, ${w} ${-len * 0.3}, 0 0 Z`;

// [angle, length, width]
const BACK_PETALS: [number, number, number][] = [
  [-98, 58, 20], [98, 58, 20], [-68, 70, 22], [68, 70, 22], [-38, 76, 22], [38, 76, 22], [0, 80, 22],
];
const FRONT_PETALS: [number, number, number][] = [
  [-112, 50, 18], [112, 50, 18], [-55, 62, 20], [55, 62, 20], [-22, 66, 20], [22, 66, 20],
];

function Bloom({ id, x, y, scale = 1, rotate = 0 }: { id: string; x: number; y: number; scale?: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      {BACK_PETALS.map(([a, l, w], i) => (
        <g key={`b${i}`} transform={`rotate(${a})`}>
          <path d={petalPath(l, w)} fill={`url(#${id}-petal-soft)`} stroke="#E58AAE" strokeWidth="0.6" strokeOpacity="0.5" />
          <path d={`M0 -4 Q 1 ${-l * 0.5} 0 ${-l * 0.92}`} stroke="#fff" strokeWidth="0.8" strokeOpacity="0.55" fill="none" />
        </g>
      ))}
      {/* Golden seed pod */}
      <ellipse cx="0" cy="-26" rx="17" ry="9" fill={`url(#${id}-pod)`} />
      {[-9, -3, 3, 9].map((dx) => (
        <circle key={dx} cx={dx} cy={-27} r="1.3" fill="#B7862E" opacity="0.7" />
      ))}
      {FRONT_PETALS.map(([a, l, w], i) => (
        <g key={`f${i}`} transform={`rotate(${a})`}>
          <path d={petalPath(l, w)} fill={`url(#${id}-petal)`} stroke="#D65587" strokeWidth="0.6" strokeOpacity="0.45" />
          <path d={`M0 -4 Q 1.5 ${-l * 0.5} 0 ${-l * 0.9}`} stroke="#fff" strokeWidth="0.9" strokeOpacity="0.6" fill="none" />
        </g>
      ))}
    </g>
  );
}

function Bud({ id, x, y, scale = 1, rotate = 0 }: { id: string; x: number; y: number; scale?: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <path d={petalPath(52, 13)} transform="rotate(-14)" fill={`url(#${id}-petal-soft)`} />
      <path d={petalPath(52, 13)} transform="rotate(14)" fill={`url(#${id}-petal-soft)`} />
      <path d={petalPath(58, 15)} fill={`url(#${id}-bud)`} stroke="#D65587" strokeWidth="0.6" strokeOpacity="0.4" />
      <path d="M0 -4 Q 1.5 -28 0 -52" stroke="#fff" strokeWidth="0.9" strokeOpacity="0.6" fill="none" />
    </g>
  );
}

function Leaf({ id, x, y, rx, ry, rotate = 0 }: { id: string; x: number; y: number; rx: number; ry: number; rotate?: number }) {
  const veins = Array.from({ length: 11 }, (_, i) => (i / 11) * Math.PI * 2);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <ellipse cx="0" cy="0" rx={rx} ry={ry} fill={`url(#${id}-leaf)`} />
      <ellipse cx="0" cy="0" rx={rx} ry={ry} fill="none" stroke="#3E5A37" strokeWidth="1.4" strokeOpacity="0.35" />
      {/* Notch of the lotus leaf */}
      <path d={`M0 ${-ry * 0.08} L ${-rx * 0.12} ${-ry} L ${rx * 0.12} ${-ry} Z`} fill="#3E5A37" opacity="0.45" />
      {veins.map((t, i) => (
        <line
          key={i}
          x1="0"
          y1="0"
          x2={Math.cos(t) * rx * 0.92}
          y2={Math.sin(t) * ry * 0.92}
          stroke="#D9E6C9"
          strokeWidth="0.8"
          strokeOpacity="0.45"
        />
      ))}
      <circle cx="0" cy="0" r="3" fill="#C9DDB4" opacity="0.7" />
    </g>
  );
}

function LotusDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-petal`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#FFF4F7" />
        <stop offset="45%" stopColor="#F7BED1" />
        <stop offset="100%" stopColor="#D9467F" />
      </linearGradient>
      <linearGradient id={`${id}-petal-soft`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#FFF8FA" />
        <stop offset="55%" stopColor="#F9CFDC" />
        <stop offset="100%" stopColor="#E77BA3" />
      </linearGradient>
      <linearGradient id={`${id}-bud`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#D8E4C4" />
        <stop offset="35%" stopColor="#FBE1E9" />
        <stop offset="100%" stopColor="#D23F78" />
      </linearGradient>
      <radialGradient id={`${id}-pod`}>
        <stop offset="0%" stopColor="#F6D77E" />
        <stop offset="100%" stopColor="#D9A441" />
      </radialGradient>
      <radialGradient id={`${id}-leaf`} cx="45%" cy="40%" r="70%">
        <stop offset="0%" stopColor="#A9C08E" />
        <stop offset="55%" stopColor="#6E8F5E" />
        <stop offset="100%" stopColor="#3F5E3A" />
      </radialGradient>
    </defs>
  );
}

/* ------------------------------------------------------------------ */
/*  Public decorations                                                 */
/* ------------------------------------------------------------------ */

type DecorProps = { className?: string; style?: React.CSSProperties };

/** Lotus blooms, buds and leaves rising from the bottom-left corner of its box. */
export function LotusCluster({ className = '', style }: DecorProps) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 300 360" className={`pointer-events-none select-none ${className}`} style={style} aria-hidden="true">
      <LotusDefs id={id} />
      {/* Stems */}
      <g stroke="#6E8F5E" strokeWidth="3.2" fill="none" strokeLinecap="round">
        <path d="M30 370 C 60 300, 110 240, 132 178" />
        <path d="M150 370 C 175 320, 205 280, 224 238" />
        <path d="M15 370 C 30 280, 55 170, 84 92" />
        <path d="M215 370 C 235 300, 255 200, 262 140" />
      </g>
      <Leaf id={id} x={62} y={305} rx={92} ry={52} rotate={-14} />
      <Leaf id={id} x={205} y={345} rx={80} ry={38} rotate={8} />
      <Bud id={id} x={84} y={96} scale={0.95} rotate={-12} />
      <Bud id={id} x={262} y={144} scale={0.7} rotate={18} />
      <Bloom id={id} x={224} y={240} scale={0.85} rotate={22} />
      <Bloom id={id} x={132} y={182} scale={1.25} rotate={12} />
    </svg>
  );
}

/** Small single lotus with flourishes — used as a section divider. */
export function LotusDivider({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-16 sm:w-28 bg-gradient-to-r from-transparent to-brand-beige-deep/50" />
      <svg viewBox="-60 -70 120 80" className="w-14 h-10">
        <LotusDefs id={id} />
        <Bloom id={id} x={0} y={0} scale={0.62} />
      </svg>
      <span className="h-px w-16 sm:w-28 bg-gradient-to-l from-transparent to-brand-beige-deep/50" />
    </div>
  );
}

/** Wavy line with a heart in the middle (as on the printed card). */
export function HeartFlourish({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 24" className={`pointer-events-none ${className}`} aria-hidden="true">
      <g fill="none" stroke="#B4376D" strokeWidth="1.2" strokeLinecap="round">
        <path d="M8 13 Q 30 5 52 13 T 88 12" />
        <path d="M192 13 Q 170 5 148 13 T 112 12" />
        <path d="M100 18 C 92 12, 90 6, 95 5 C 98 4.5, 100 7, 100 8.5 C 100 7, 102 4.5, 105 5 C 110 6, 108 12, 100 18 Z" />
      </g>
    </svg>
  );
}

/** Hanging gold ornament line (right edge of the printed card). */
export function HangingOrnament({ className = '', style }: DecorProps) {
  const motif = (y: number, s = 1) => (
    <g transform={`translate(20 ${y}) scale(${s})`}>
      <path d="M0 -16 L 12 0 L 0 16 L -12 0 Z" fill="none" stroke="#C9A46A" strokeWidth="1.2" />
      <path d="M0 -9 L 6 0 L 0 9 L -6 0 Z" fill="#C9A46A" fillOpacity="0.35" stroke="#C9A46A" strokeWidth="0.8" />
      <circle cx="0" cy="0" r="1.8" fill="#B4376D" />
      {[[-16, 0], [16, 0], [0, -20], [0, 20]].map(([cx, cy]) => (
        <circle key={`${cx}${cy}`} cx={cx} cy={cy} r="1.6" fill="#C9A46A" />
      ))}
    </g>
  );
  return (
    <svg viewBox="0 0 40 300" className={`pointer-events-none ${className}`} style={style} aria-hidden="true">
      <line x1="20" y1="0" x2="20" y2="285" stroke="#C9A46A" strokeWidth="1" strokeOpacity="0.7" />
      {motif(70)}
      {motif(190, 0.75)}
      <path d="M20 285 C 14 292, 16 298, 20 300 C 24 298, 26 292, 20 285 Z" fill="#C9A46A" fillOpacity="0.7" />
    </svg>
  );
}

/** Outline mandala (bottom-left corner of the printed card). */
export function Mandala({ className = '', style }: DecorProps) {
  const ring = (count: number, r: number, len: number, w: number, key: string) =>
    Array.from({ length: count }, (_, i) => (
      <path
        key={`${key}${i}`}
        d={petalPath(len, w)}
        transform={`rotate(${(360 / count) * i}) translate(0 ${-r})`}
        fill="none"
        stroke="#C9A46A"
        strokeWidth="1"
      />
    ));
  return (
    <svg viewBox="-125 -125 250 250" className={`pointer-events-none ${className}`} style={style} aria-hidden="true">
      <g opacity="0.55">
        <circle r="18" fill="none" stroke="#C9A46A" strokeWidth="1" />
        <circle r="6" fill="#C9A46A" fillOpacity="0.4" />
        {ring(8, 18, 22, 8, 'a')}
        <circle r="44" fill="none" stroke="#C9A46A" strokeWidth="0.8" strokeDasharray="2 3" />
        {ring(16, 46, 30, 9, 'b')}
        <circle r="80" fill="none" stroke="#C9A46A" strokeWidth="0.8" />
        {ring(24, 82, 34, 8, 'c')}
        <circle r="120" fill="none" stroke="#C9A46A" strokeWidth="0.6" strokeDasharray="1 4" />
      </g>
    </svg>
  );
}
