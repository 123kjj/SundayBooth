// Vector stickers drawn straight onto canvas so they are crisp at any export size.
// Authored in a 100×100 box. Each sticker gets a white die-cut edge + a thin ink line.

export type StickerKind = 'heart' | 'star' | 'sparkle' | 'flower' | 'cherry' | 'bow' | 'cloud' | 'smiley';

interface Part {
  d: string;
  fill?: string;
  line?: boolean; // stroke-only (stems, mouths)
  outline?: boolean; // include in die-cut silhouette (default true)
  stroke?: string; // outline colour override
}

const INK = '#6E4352';

function circle(cx: number, cy: number, r: number) {
  return `M${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} Z`;
}

function starPath(points: number, outer: number, inner: number) {
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    d += `${i === 0 ? 'M' : 'L'}${(50 + r * Math.cos(a)).toFixed(2)} ${(52 + r * Math.sin(a)).toFixed(2)} `;
  }
  return d + 'Z';
}

function flowerPetals() {
  let d = '';
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    d += circle(50 + 22 * Math.cos(a), 50 + 22 * Math.sin(a), 19) + ' ';
  }
  return d;
}

export const STICKERS: Record<StickerKind, { label: string; line: string; parts: Part[] }> = {
  heart: {
    label: 'heart', line: '#D2668A',
    parts: [{ d: 'M50 84 C22 66 8 48 13 31 C18 14 41 11 50 30 C59 11 82 14 87 31 C92 48 78 66 50 84 Z', fill: '#F5A9C0' }, { d: circle(31, 33, 5.5), fill: 'rgba(255,255,255,0.85)', outline: false }],
  },
  star: { label: 'star', line: '#D7A93E', parts: [{ d: starPath(5, 40, 19), fill: '#FBE39A' }, { d: circle(44, 38, 3.8), fill: 'rgba(255,255,255,0.85)', outline: false }] },
  sparkle: {
    label: 'sparkle', line: '#9C86D2',
    parts: [{ d: 'M50 6 C53 36 64 47 94 50 C64 53 53 64 50 94 C47 64 36 53 6 50 C36 47 47 36 50 6 Z', fill: '#DCD0F5' }],
  },
  flower: {
    label: 'flower', line: '#7FA5CF',
    parts: [
      { d: flowerPetals(), fill: '#C9DEF1' },
      { d: circle(50, 50, 12), fill: '#FBE39A', stroke: '#D7A93E' },
    ],
  },
  cherry: {
    label: 'cherries', line: '#C24E72',
    parts: [
      { d: 'M33 58 Q38 34 62 16 M67 60 Q62 38 62 16', line: true },
      { d: 'M62 16 C70 6 86 9 89 20 C79 26 68 25 62 16 Z', fill: '#C6E2BC', stroke: '#7FAA72' },
      { d: circle(33, 70, 16), fill: '#EC7C98' },
      { d: circle(67, 73, 16), fill: '#EC7C98' },
      { d: circle(27, 64, 4) + ' ' + circle(61, 67, 4), fill: '#FFFFFF', outline: false },
    ],
  },
  bow: {
    label: 'bow', line: '#D2668A',
    parts: [
      { d: 'M47 53 L36 88 L48 80 Z M53 53 L64 88 L52 80 Z', fill: '#F2A7B6' },
      { d: 'M50 48 C36 26 9 28 11 48 C9 70 36 70 50 48 Z', fill: '#F6C2CC' },
      { d: 'M50 48 C64 26 91 28 89 48 C91 70 64 70 50 48 Z', fill: '#F6C2CC' },
      { d: circle(50, 48, 8), fill: '#F2A7B6' },
    ],
  },
  cloud: {
    label: 'cloud', line: '#8CB0D6',
    parts: [{ d: 'M27 72 C11 72 8 52 23 48 C21 31 42 24 51 37 C58 22 82 27 79 46 C94 46 95 72 77 72 Z', fill: '#FFFDF8' }],
  },
  smiley: {
    label: 'smiley', line: '#D7A93E',
    parts: [
      { d: circle(50, 50, 37), fill: '#F6DC85' },
      { d: circle(38, 44, 4.2) + ' ' + circle(62, 44, 4.2), fill: INK, outline: false },
      { d: 'M35 58 Q50 72 65 58', line: true, outline: false },
    ],
  },
};

export const STICKER_KINDS = Object.keys(STICKERS) as StickerKind[];

const pathCache = new Map<string, Path2D>();
const p2d = (d: string) => {
  let p = pathCache.get(d);
  if (!p) {
    p = new Path2D(d);
    pathCache.set(d, p);
  }
  return p;
};

/** Draw a sticker centred at (x, y) with the given size (px) and rotation (deg). */
export function drawSticker(ctx: CanvasRenderingContext2D, kind: StickerKind, x: number, y: number, size: number, rotation = 0) {
  const { parts, line } = STICKERS[kind];
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(size / 100, size / 100);
  ctx.translate(-50, -50);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // soft drop shadow + white die-cut edge
  ctx.save();
  ctx.shadowColor = 'rgba(63,54,51,0.18)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2.5;
  ctx.strokeStyle = '#FFFFFF';
  ctx.fillStyle = '#FFFFFF';
  ctx.lineWidth = 16;
  for (const part of parts) {
    if (part.outline === false) continue;
    ctx.stroke(p2d(part.d));
    if (!part.line) ctx.fill(p2d(part.d));
  }
  ctx.restore();

  for (const part of parts) {
    const path = p2d(part.d);
    if (part.line) {
      ctx.strokeStyle = part.outline === false ? INK : '#7FAA72';
      ctx.lineWidth = part.outline === false ? 4.5 : 5;
      ctx.stroke(path);
      continue;
    }
    ctx.fillStyle = part.fill ?? '#fff';
    ctx.fill(path);
    if (part.outline !== false) {
      ctx.strokeStyle = part.stroke ?? line;
      ctx.lineWidth = 3.6;
      ctx.stroke(path);
    }
  }
  ctx.restore();
}
