import { drawSticker, type StickerKind } from './stickers';

export type CaptionFont = 'hand' | 'serif' | 'mono';
export type Pattern = 'plain' | 'gingham' | 'dots';

export interface StripOptions {
  background: string;
  pattern: Pattern;
  borderColor: string;
  borderWidth: number; // 0–12 (strip units)
  rounded: boolean;
  spacing: number; // 6–32
  stickers: StickerKind[];
  shuffle: number;
  caption: string;
  captionFont: CaptionFont;
  showDate: boolean;
  doodle: boolean;
}

export const DEFAULT_OPTIONS: StripOptions = {
  background: '#FBE3EA',
  pattern: 'gingham',
  borderColor: '#FFFFFF',
  borderWidth: 7,
  rounded: true,
  spacing: 14,
  stickers: ['bow', 'cherry', 'heart'],
  shuffle: 0,
  caption: 'good vibes ♡',
  captionFont: 'hand',
  showDate: true,
  doodle: true,
};

export interface Preset {
  id: string;
  name: string;
  options: Omit<StripOptions, 'caption' | 'showDate' | 'shuffle'>;
}

export const PRESETS: Preset[] = [
  {
    id: 'picnic', name: 'Picnic Gingham',
    options: { background: '#FBE3EA', pattern: 'gingham', borderColor: '#FFFFFF', borderWidth: 7, rounded: true, spacing: 14, stickers: ['bow', 'cherry', 'heart'], captionFont: 'hand', doodle: true },
  },
  {
    id: 'strawberry', name: 'Strawberry Milk',
    options: { background: '#F9D7E0', pattern: 'plain', borderColor: '#FFF4E8', borderWidth: 6, rounded: true, spacing: 14, stickers: ['heart', 'bow', 'sparkle'], captionFont: 'hand', doodle: true },
  },
  {
    id: 'blueberry', name: 'Blueberry Soda',
    options: { background: '#D6E6F5', pattern: 'dots', borderColor: '#FFFFFF', borderWidth: 6, rounded: true, spacing: 16, stickers: ['cloud', 'star', 'sparkle'], captionFont: 'hand', doodle: true },
  },
  {
    id: 'butter', name: 'Butter Cookie',
    options: { background: '#FCEFC2', pattern: 'plain', borderColor: '#FFFCF9', borderWidth: 6, rounded: true, spacing: 12, stickers: ['smiley', 'cherry', 'star'], captionFont: 'serif', doodle: true },
  },
  {
    id: 'lavender', name: 'Lavender Letter',
    options: { background: '#E6DCF6', pattern: 'dots', borderColor: '#FFFFFF', borderWidth: 8, rounded: true, spacing: 12, stickers: ['sparkle', 'flower', 'heart'], captionFont: 'serif', doodle: false },
  },
  {
    id: 'darkroom', name: 'After Dark',
    options: { background: '#3B2B31', pattern: 'plain', borderColor: '#FBE8ED', borderWidth: 3, rounded: false, spacing: 14, stickers: ['star'], captionFont: 'mono', doodle: false },
  },
];

export const BACKGROUNDS = ['#FFFCF9', '#F9D7E0', '#FBE3EA', '#D6E6F5', '#FCEFC2', '#E6DCF6', '#D9ECD6', '#3B2B31'];
export const BORDERS = ['#FFFFFF', '#FFF4E8', '#F2AFC2', '#E28AA4', '#8CB0D6', '#E2BB55', '#A994D8', '#6E4352'];
export const PATTERNS: { id: Pattern; label: string }[] = [
  { id: 'plain', label: 'plain' },
  { id: 'gingham', label: 'gingham' },
  { id: 'dots', label: 'polka dots' },
];

// ---------- layout (strip units; 1 unit = 1px at scale 1) ----------
export const STRIP_W = 400;
const MARGIN = 24;
const PHOTO_W = STRIP_W - MARGIN * 2; // 352
const PHOTO_H = Math.round((PHOTO_W * 3) / 4); // 264, 4:3 like a real booth frame

export function hasFooter(o: StripOptions) {
  return Boolean(o.caption.trim()) || o.showDate || o.doodle;
}

export function layout(o: StripOptions) {
  const footer = hasFooter(o) ? 108 : 40;
  const photos = [0, 1, 2, 3].map((i) => ({
    x: MARGIN,
    y: MARGIN + i * (PHOTO_H + o.spacing),
    w: PHOTO_W,
    h: PHOTO_H,
  }));
  const photosBottom = photos[3].y + PHOTO_H;
  const height = photosBottom + footer;
  return { width: STRIP_W, height, photos, photosBottom, footer };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function isDark(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 120;
}

function lum(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16);
  return 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
}
export const isLight = (hex: string) => lum(hex) > 225;

export function formatDate(d = new Date()) {
  const m = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  return `${m} ${String(d.getDate()).padStart(2, '0')} · ${d.getFullYear()}`;
}

const FONT: Record<CaptionFont, { family: string; size: number; weight: number; tracking: number }> = {
  hand: { family: '"Mali"', size: 30, weight: 700, tracking: 0 },
  serif: { family: '"Fraunces"', size: 27, weight: 600, tracking: 0 },
  mono: { family: '"DM Mono"', size: 19, weight: 500, tracking: 2.4 },
};

/** Make sure fonts used on canvas are loaded before drawing. */
export async function loadStripFonts() {
  if (!document.fonts) return;
  await Promise.all([
    document.fonts.load('700 30px "Mali"'),
    document.fonts.load('600 27px "Fraunces"'),
    document.fonts.load('500 19px "DM Mono"'),
    document.fonts.load('400 13px "DM Mono"'),
  ]).catch(() => undefined);
}

function stickerSlots(L: ReturnType<typeof layout>) {
  const p = L.photos;
  const fy = L.photosBottom + L.footer / 2;
  return [
    { x: p[0].x + p[0].w - 14, y: p[0].y + 18, s: 74, r: 14 },
    { x: p[2].x + 18, y: p[2].y + p[2].h - 16, s: 68, r: -12 },
    { x: MARGIN + 34, y: fy, s: 54, r: -10 },
    { x: p[1].x + 16, y: p[1].y + 18, s: 58, r: -8 },
    { x: p[3].x + p[3].w - 18, y: p[3].y + p[3].h - 16, s: 70, r: 10 },
    { x: STRIP_W - MARGIN - 34, y: fy, s: 54, r: 12 },
    { x: p[1].x + p[1].w - 16, y: p[1].y + p[1].h - 16, s: 52, r: 8 },
    { x: p[2].x + p[2].w - 14, y: p[2].y + 16, s: 52, r: -6 },
    { x: p[0].x + 16, y: p[0].y + p[0].h - 14, s: 48, r: -14 },
    { x: p[3].x + 16, y: p[3].y + 16, s: 50, r: 6 },
  ];
}
export const MAX_STICKERS = 10;

function drawCover(ctx: CanvasRenderingContext2D, img: CanvasImageSource & { width: number; height: number }, x: number, y: number, w: number, h: number) {
  const ir = img.width / img.height;
  const r = w / h;
  let sw = img.width, sh = img.height, sx = 0, sy = 0;
  if (ir > r) { sw = img.height * r; sx = (img.width - sw) / 2; }
  else { sh = img.width / r; sy = (img.height - sh) / 2; }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function drawPattern(ctx: CanvasRenderingContext2D, pattern: Pattern, w: number, h: number, dark: boolean) {
  if (pattern === 'plain') return;
  ctx.save();
  ctx.fillStyle = dark ? 'rgba(255,255,255,0.07)' : 'rgba(214,110,145,0.16)';
  if (pattern === 'gingham') {
    const c = 14;
    for (let x = 0; x < w; x += c * 2) ctx.fillRect(x, 0, c, h);
    for (let y = 0; y < h; y += c * 2) ctx.fillRect(0, y, w, c);
  } else {
    const c = 16;
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.12)' : 'rgba(214,110,145,0.3)';
    for (let y = c / 2, row = 0; y < h; y += c, row++)
      for (let x = row % 2 ? c : c / 2; x < w; x += c) {
        ctx.beginPath();
        ctx.arc(x, y, 1.9, 0, Math.PI * 2);
        ctx.fill();
      }
  }
  ctx.restore();
}

function wavy(ctx: CanvasRenderingContext2D, cx: number, cy: number, width: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const steps = 6;
  const seg = width / steps;
  ctx.moveTo(cx - width / 2, cy);
  for (let i = 0; i < steps; i++) {
    const x0 = cx - width / 2 + i * seg;
    ctx.quadraticCurveTo(x0 + seg / 2, cy + (i % 2 ? 4 : -4), x0 + seg, cy);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws the full strip. The preview and the downloaded PNG both come from this
 * one function, only the scale differs, so they always match.
 */
export function renderStrip(
  canvas: HTMLCanvasElement,
  photos: (HTMLCanvasElement | null)[],
  o: StripOptions,
  scale: number,
  date = new Date(),
) {
  const L = layout(o);
  canvas.width = Math.round(L.width * scale);
  canvas.height = Math.round(L.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, L.width, L.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const stripR = o.rounded ? 20 : 0;
  const photoR = o.rounded ? 12 : 0;
  const dark = isDark(o.background);
  const text = dark ? '#FBE8ED' : '#6E4352';
  const faint = dark ? 'rgba(251,232,237,0.6)' : 'rgba(110,67,82,0.55)';

  // paper
  ctx.save();
  roundRect(ctx, 0, 0, L.width, L.height, stripR);
  ctx.clip();
  ctx.fillStyle = o.background;
  ctx.fillRect(0, 0, L.width, L.height);
  drawPattern(ctx, o.pattern, L.width, L.height, dark);

  // photos
  L.photos.forEach((r, i) => {
    const bw = o.borderWidth;
    if (bw > 0) {
      ctx.fillStyle = o.borderColor;
      roundRect(ctx, r.x, r.y, r.w, r.h, photoR);
      ctx.fill();
    }
    const ix = r.x + bw, iy = r.y + bw, iw = r.w - bw * 2, ih = r.h - bw * 2;
    ctx.save();
    roundRect(ctx, ix, iy, iw, ih, Math.max(0, photoR - bw * 0.6));
    ctx.clip();
    const img = photos[i];
    if (img) drawCover(ctx, img, ix, iy, iw, ih);
    else {
      ctx.fillStyle = dark ? '#463E3B' : 'rgba(63,54,51,0.08)';
      ctx.fillRect(ix, iy, iw, ih);
    }
    ctx.restore();
  });

  // footer
  const fTop = L.photosBottom;
  const caption = o.caption.trim();
  const items: ('caption' | 'date' | 'doodle')[] = [];
  if (caption) items.push('caption');
  if (o.doodle) items.push('doodle');
  if (o.showDate) items.push('date');
  if (items.length) {
    const heights = { caption: o.captionFont === 'hand' ? 40 : 32, doodle: 14, date: 18 };
    const total = items.reduce((s, k) => s + heights[k], 0);
    let y = fTop + (L.footer - total) / 2 + 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const k of items) {
      const cy = y + heights[k] / 2;
      if (k === 'caption') {
        const f = FONT[o.captionFont];
        ctx.fillStyle = text;
        let size = f.size;
        const shown = o.captionFont === 'mono' ? caption.toUpperCase() : caption;
        ctx.font = `${f.weight} ${size}px ${f.family}`;
        if ('letterSpacing' in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = `${f.tracking}px`;
        while (ctx.measureText(shown).width > L.width - 196 && size > 12) {
          size -= 1;
          ctx.font = `${f.weight} ${size}px ${f.family}`;
        }
        ctx.fillText(shown, L.width / 2, cy + (o.captionFont === 'hand' ? 1 : 0));
      } else if (k === 'doodle') {
        const accent = o.borderWidth > 0 && !isLight(o.borderColor) && o.borderColor !== o.background;
        wavy(ctx, L.width / 2, cy, 64, accent ? o.borderColor : faint);
      } else {
        ctx.fillStyle = faint;
        ctx.font = `400 12.5px "DM Mono"`;
        if ('letterSpacing' in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = '2.2px';
        ctx.fillText(formatDate(date), L.width / 2, cy);
      }
      y += heights[k];
    }
    if ('letterSpacing' in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = '0px';
  }

  // stickers
  const slots = stickerSlots(L);
  o.stickers.slice(0, MAX_STICKERS).forEach((kind, i) => {
    const slot = slots[(i + o.shuffle * 3) % slots.length];
    const jitter = ((o.shuffle * 37 + i * 53) % 21) - 10;
    drawSticker(ctx, kind, slot.x, slot.y, slot.s, slot.r + jitter);
  });
  ctx.restore();
  return canvas;
}

export function stripToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create image'))), 'image/png'),
  );
}

export async function downloadStrip(photos: (HTMLCanvasElement | null)[], o: StripOptions, date: Date) {
  await loadStripFonts();
  const canvas = renderStrip(document.createElement('canvas'), photos, o, 3, date); // 1200px wide
  const blob = await stripToBlob(canvas);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const ymd = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  a.download = `sunday-booth-${ymd}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
