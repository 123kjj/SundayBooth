// Scrapbook stickers and illustrations, all inline SVG.
// Each one is outlined in a deeper shade of its own fill (no black lines),
// with a small white glint, like puffy vinyl stickers.

import type { CSSProperties, ReactNode } from 'react';

type P = { className?: string; style?: CSSProperties; size?: number };
const hl = 'rgba(255,255,255,0.85)';

const TONES = {
  pink: { fill: '#F7BCCB', line: '#D2668A' },
  rose: { fill: '#F5A9C0', line: '#D2668A' },
  blue: { fill: '#C9DEF1', line: '#7FA5CF' },
  lav: { fill: '#DCD0F5', line: '#9C86D2' },
  butter: { fill: '#FBE39A', line: '#D7A93E' },
  mint: { fill: '#CFE6C8', line: '#83AE77' },
};
export type Tone = keyof typeof TONES;

const svg = (size: number | undefined, vb: string, className = '', style?: CSSProperties, children?: ReactNode, label?: string) => (
  <svg
    viewBox={vb}
    width={size}
    height={size}
    className={className}
    style={style}
    aria-hidden={label ? undefined : true}
    role={label ? 'img' : undefined}
    aria-label={label}
  >
    {children}
  </svg>
);

export function HeartIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  return svg(size, '0 0 24 24', className, undefined, <path d="M12 20.5C6.4 16.6 3 13.4 3 9.4 3 6.6 5.1 4.6 7.6 4.6c1.8 0 3.3 1 4.4 2.6 1.1-1.6 2.6-2.6 4.4-2.6 2.5 0 4.6 2 4.6 4.8 0 4-3.4 7.2-9 11.1z" fill="currentColor" />);
}

export function Heart({ tone = 'rose', ...p }: P & { tone?: Tone }) {
  const t = TONES[tone];
  return svg(p.size ?? 28, '0 0 100 100', p.className, p.style, (
    <>
      <path d="M50 86C21 67 8 50 12 32 15 16 39 12 50 31 61 12 85 16 88 32 92 50 79 67 50 86Z" fill={t.fill} stroke={t.line} strokeWidth="5" strokeLinejoin="round" />
      <ellipse cx="31" cy="33" rx="7" ry="5" fill={hl} transform="rotate(-30 31 33)" />
    </>
  ));
}

export function Star({ tone = 'butter', ...p }: P & { tone?: Tone }) {
  const t = TONES[tone];
  let d = '';
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 19 : 42;
    const a = (Math.PI * i) / 5 - Math.PI / 2;
    d += `${i ? 'L' : 'M'}${(50 + r * Math.cos(a)).toFixed(1)} ${(54 + r * Math.sin(a)).toFixed(1)}`;
  }
  return svg(p.size ?? 26, '0 0 100 100', p.className, p.style, (
    <>
      <path d={d + 'Z'} fill={t.fill} stroke={t.line} strokeWidth="7" strokeLinejoin="round" />
      <circle cx="43" cy="40" r="4.5" fill={hl} />
    </>
  ));
}

export function Sparkle({ tone = 'lav', ...p }: P & { tone?: Tone }) {
  const t = TONES[tone];
  return svg(p.size ?? 20, '0 0 100 100', p.className, p.style,
    <path d="M50 6C53 36 64 47 94 50 64 53 53 64 50 94 47 64 36 53 6 50 36 47 47 36 50 6Z" fill={t.fill} stroke={t.line} strokeWidth="6" strokeLinejoin="round" />,
  );
}

export function Cherry(p: P) {
  return svg(p.size ?? 40, '0 0 100 100', p.className, p.style, (
    <>
      <path d="M32 60Q37 34 62 15M68 63Q62 38 62 15" fill="none" stroke="#83AE77" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M62 15C71 5 87 8 90 20 79 26 68 24 62 15Z" fill="#CFE6C8" stroke="#83AE77" strokeWidth="3.5" strokeLinejoin="round" />
      <circle cx="31" cy="72" r="17" fill="#EC7C98" stroke="#C24E72" strokeWidth="4" />
      <circle cx="68" cy="76" r="17" fill="#EC7C98" stroke="#C24E72" strokeWidth="4" />
      <circle cx="25" cy="66" r="4.5" fill={hl} />
      <circle cx="62" cy="70" r="4.5" fill={hl} />
    </>
  ));
}

export function Bow({ tone = 'pink', ...p }: P & { tone?: Tone }) {
  const t = TONES[tone];
  return svg(p.size ?? 44, '0 0 120 90', p.className, p.style, (
    <g stroke={t.line} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M55 46 40 84 52 77 58 87 62 48Z" fill={t.fill} />
      <path d="M65 46 80 84 68 77 62 87 58 48Z" fill={t.fill} />
      <path d="M60 40C46 16 12 14 12 36 12 60 44 62 60 44Z" fill={t.fill} />
      <path d="M60 40C74 16 108 14 108 36 108 60 76 62 60 44Z" fill={t.fill} />
      <path d="M50 36C40 30 28 30 24 36M70 36C80 30 92 30 96 36" fill="none" opacity="0.6" />
      <rect x="51" y="32" width="18" height="18" rx="7" fill={t.fill} />
      <ellipse cx="26" cy="30" rx="6" ry="3.5" fill={hl} stroke="none" transform="rotate(-20 26 30)" />
    </g>
  ));
}

export function CD(p: P) {
  const wedges = ['#F7BCCB', '#FBE39A', '#CFE6C8', '#C9DEF1', '#DCD0F5', '#F7BCCB', '#C9DEF1', '#FBE39A'];
  return svg(p.size ?? 60, '0 0 100 100', p.className, p.style, (
    <>
      <circle cx="50" cy="50" r="46" fill="#ECE8F2" />
      {wedges.map((c, i) => {
        const a0 = (i / wedges.length) * Math.PI * 2, a1 = ((i + 1) / wedges.length) * Math.PI * 2;
        return <path key={i} d={`M50 50L${50 + 46 * Math.cos(a0)} ${50 + 46 * Math.sin(a0)}A46 46 0 0 1 ${50 + 46 * Math.cos(a1)} ${50 + 46 * Math.sin(a1)}Z`} fill={c} opacity="0.75" />;
      })}
      <circle cx="50" cy="50" r="30" fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.7" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.6" />
      <path d="M22 30A34 34 0 0 1 44 16" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
      <circle cx="50" cy="50" r="46" fill="none" stroke="#B9AFCB" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="14" fill="#F8F5FB" stroke="#B9AFCB" strokeWidth="2" />
      <circle cx="50" cy="50" r="5.5" fill="#FBE8ED" stroke="#B9AFCB" strokeWidth="2" />
    </>
  ));
}

export function RetroTV({ text = ['good', 'vibes ♡'], ...p }: P & { text?: [string, string] | string[] }) {
  return svg(p.size ?? 120, '0 0 130 120', p.className, p.style, (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M50 22 36 4M72 22 88 6" stroke="#9C86D2" strokeWidth="3.5" />
      <circle cx="36" cy="5" r="4.5" fill="#F5A9C0" stroke="#D2668A" strokeWidth="2.5" />
      <circle cx="88" cy="6" r="4.5" fill="#FBE39A" stroke="#D7A93E" strokeWidth="2.5" />
      <rect x="6" y="22" width="118" height="84" rx="16" fill="#DCD0F5" stroke="#9C86D2" strokeWidth="3.5" />
      <rect x="16" y="32" width="76" height="62" rx="12" fill="#FDE6EE" stroke="#9C86D2" strokeWidth="3" />
      <path d="M22 40Q24 35 30 35" stroke="#fff" strokeWidth="3" fill="none" />
      <text x="54" y="58" textAnchor="middle" fontFamily="Mali, cursive" fontWeight="700" fontSize="15" fill="#C25A7D" transform="rotate(-6 54 64)">{text[0]}</text>
      <text x="55" y="78" textAnchor="middle" fontFamily="Mali, cursive" fontWeight="700" fontSize="15" fill="#C25A7D" transform="rotate(-6 54 64)">{text[1]}</text>
      <circle cx="108" cy="46" r="7" fill="#FBE39A" stroke="#D7A93E" strokeWidth="2.5" />
      <circle cx="108" cy="66" r="5.5" fill="#F5A9C0" stroke="#D2668A" strokeWidth="2.5" />
      <path d="M101 82h14M101 88h14M101 94h14" stroke="#9C86D2" strokeWidth="2.2" />
      <path d="M22 106l-4 9M108 106l4 9" stroke="#9C86D2" strokeWidth="3.5" />
    </g>
  ), 'Retro television that says good vibes');
}

export function Camera(p: P) {
  return svg(p.size ?? 160, '0 0 170 130', p.className, p.style, (
    <g strokeLinejoin="round" strokeLinecap="round">
      <rect x="22" y="22" width="38" height="16" rx="6" fill="#F5A9C0" stroke="#D2668A" strokeWidth="3.5" />
      <rect x="112" y="24" width="22" height="12" rx="4" fill="#FBE39A" stroke="#D7A93E" strokeWidth="3" />
      <rect x="8" y="34" width="154" height="88" rx="22" fill="#F7BCCB" stroke="#D2668A" strokeWidth="4" />
      <path d="M8 62H162" stroke="#D2668A" strokeWidth="3" opacity="0.5" />
      <rect x="16" y="44" width="26" height="12" rx="5" fill="#FFF4F7" stroke="#D2668A" strokeWidth="2.5" />
      <circle cx="88" cy="80" r="33" fill="#FFF4F7" stroke="#D2668A" strokeWidth="4" />
      <circle cx="88" cy="80" r="23" fill="#5D5068" stroke="#D2668A" strokeWidth="3" />
      <circle cx="88" cy="80" r="13" fill="#3F3448" />
      <circle cx="80" cy="72" r="5.5" fill="#fff" opacity="0.9" />
      <circle cx="95" cy="88" r="2.5" fill="#fff" opacity="0.6" />
      <circle cx="146" cy="52" r="5" fill="#C9DEF1" stroke="#7FA5CF" strokeWidth="2.5" />
      <path d="M20 40Q28 37 36 40" stroke="#fff" strokeWidth="3" fill="none" opacity="0.8" />
    </g>
  ), 'Pink camera');
}

export function FlipPhone(p: P) {
  return svg(p.size ?? 60, '0 0 70 120', p.className, p.style, (
    <g strokeLinejoin="round" strokeLinecap="round" transform="rotate(14 35 60)">
      <rect x="10" y="6" width="50" height="54" rx="12" fill="#DCD0F5" stroke="#9C86D2" strokeWidth="3.5" />
      <rect x="17" y="14" width="36" height="30" rx="6" fill="#FDE6EE" stroke="#9C86D2" strokeWidth="2.5" />
      <path d="M30 26c-3-4-9-1-6 3l6 5 6-5c3-4-3-7-6-3z" fill="#F5A9C0" />
      <rect x="10" y="62" width="50" height="52" rx="12" fill="#F7BCCB" stroke="#D2668A" strokeWidth="3.5" />
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={18 + c * 12} y={74 + r * 11} width="9" height="6" rx="3" fill="#FFF4F7" stroke="#D2668A" strokeWidth="1.5" />))}
    </g>
  ));
}

export function Printer({ className = '', active = false }: { className?: string; active?: boolean }) {
  return svg(undefined, '0 0 320 200', className, undefined, (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M118 52V30c0-14 10-22 24-22h36c14 0 24 8 24 22v22" fill="none" stroke="#D2668A" strokeWidth="12" />
      <path d="M118 52V30c0-14 10-22 24-22h36c14 0 24 8 24 22v22" fill="none" stroke="#F7BCCB" strokeWidth="6" />
      <rect x="20" y="46" width="280" height="138" rx="30" fill="#F7BCCB" stroke="#D2668A" strokeWidth="4" />
      <rect x="20" y="46" width="280" height="40" rx="22" fill="#F5A9C0" stroke="#D2668A" strokeWidth="4" />
      <path d="M42 60Q52 54 66 56" stroke="#fff" strokeWidth="4" fill="none" opacity="0.8" />
      <rect x="92" y="102" width="136" height="34" rx="17" fill="#FFF6F0" stroke="#D2668A" strokeWidth="3" />
      <text x="160" y="125" textAnchor="middle" fontFamily="Mali, cursive" fontWeight="700" fontSize="14.5" fill="#C25A7D">sunday booth ♡</text>
      <circle cx="262" cy="120" r="9" fill={active ? '#B9E2A8' : '#FFF4F7'} stroke="#D2668A" strokeWidth="3">
        {active && <animate attributeName="fill" values="#B9E2A8;#FFF4F7;#B9E2A8" dur="0.8s" repeatCount="indefinite" />}
      </circle>
      <path d="M48 114c-3-4-9-1-6 3l6 5 6-5c3-4-3-7-6-3z" fill="#fff" stroke="#D2668A" strokeWidth="2" />
      <rect x="70" y="166" width="180" height="12" rx="6" fill="#6E4352" />
    </g>
  ));
}

/* ---------- hand-drawn doodles ---------- */
export function Squiggle({ className = '', color = '#E28AA4', width = 70 }: { className?: string; color?: string; width?: number }) {
  return (
    <svg className={className} width={width} height={width / 5} viewBox="0 0 100 20" aria-hidden>
      <path d="M2 10C10 2 16 2 24 10S38 18 46 10 60 2 68 10 82 18 98 10" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
export function DoodleArrow({ className = '', color = '#C25A7D' }: { className?: string; color?: string }) {
  return (
    <svg className={className} width="54" height="40" viewBox="0 0 60 44" aria-hidden>
      <path d="M4 8C18 2 34 6 40 18 44 26 42 34 36 38" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 32 36 39 44 33" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function DoodleHeart({ className = '', color = '#E28AA4', size = 22 }: { className?: string; color?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 20C7 16.5 3.5 13.5 3.6 9.6 3.7 6.9 5.8 5 8.1 5.1c1.6.1 3 1.2 3.8 2.6.9-1.6 2.4-2.7 4.1-2.6 2.4.2 4.3 2.3 4.1 5-.3 3.8-3.5 6.6-8.1 9.9z" fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- wordmark ---------- */
export function Logo({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const big = size === 'lg';
  return (
    <span
      className={`inline-block font-display font-bold leading-[0.88] tracking-[-0.02em] ${big ? 'text-[64px] sm:text-[86px]' : 'text-[24px]'}`}
      style={{
        color: big ? '#EE8FAB' : '#E07E9B',
        WebkitTextStroke: big ? '10px #FFFCF9' : undefined,
        paintOrder: 'stroke fill',
        filter: big ? 'drop-shadow(0 4px 0 #E7A3B8) drop-shadow(0 10px 14px rgba(194,90,125,0.25))' : 'drop-shadow(0 2px 0 #FFFCF9)',
      }}
    >
      {big ? (
        <>
          <span className="block">sunday</span>
          <span className="block pl-[0.8em]">booth</span>
        </>
      ) : (
        'sunday booth'
      )}
    </span>
  );
}

/* ---------- window chrome ---------- */
export function Win({
  title = 'sunday booth',
  children,
  className = '',
  bodyClassName = 'p-5 sm:p-7',
  barClassName = '',
}: {
  title?: string;
  barClassName?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={`win ${className}`}>
      <div className={`win-bar ${barClassName}`}>
        <span className="win-title">
          {title} <HeartIcon size={12} />
        </span>
        <span className="flex gap-1.5" aria-hidden>
          <span className="win-btn">–</span>
          <span className="win-btn">
            <span className="h-[7px] w-[7px] rounded-[2px] border-[1.5px] border-current" />
          </span>
          <span className="win-btn !border-dusty !bg-rose !text-white">×</span>
        </span>
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

/** A little handwritten speech-bubble sticker ("so cute!") */
export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex h-[74px] w-[74px] items-center justify-center rounded-full bg-paper text-center font-hand text-[16px] font-bold leading-[0.95] text-berry ${className}`}
      style={{ border: '2px dashed #E7A3B8', boxShadow: '0 0 0 4px #FFFCF9, 0 6px 14px -8px rgba(194,90,125,0.6)' }}
    >
      {children}
    </span>
  );
}
