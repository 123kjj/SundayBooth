import { applyFilm, type FilmId } from './filters';

// Captured frames stay in memory only. Filtered versions are cached per film.
const seeds = new WeakMap<HTMLCanvasElement, number>();
const filtered = new WeakMap<HTMLCanvasElement, Map<FilmId, HTMLCanvasElement>>();
const thumbs = new WeakMap<HTMLCanvasElement, string>();

export function registerCapture(raw: HTMLCanvasElement) {
  seeds.set(raw, Math.floor(Math.random() * 1e6));
}

export function getFiltered(raw: HTMLCanvasElement, film: FilmId) {
  let m = filtered.get(raw);
  if (!m) {
    m = new Map();
    filtered.set(raw, m);
  }
  let c = m.get(film);
  if (!c) {
    c = applyFilm(raw, film, seeds.get(raw) ?? 1);
    m.set(film, c);
  }
  return c;
}

export function getThumb(filteredCanvas: HTMLCanvasElement) {
  let t = thumbs.get(filteredCanvas);
  if (!t) {
    const small = document.createElement('canvas');
    small.width = 480;
    small.height = Math.round((480 * filteredCanvas.height) / filteredCanvas.width);
    const ctx = small.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(filteredCanvas, 0, 0, small.width, small.height);
    t = small.toDataURL('image/jpeg', 0.88);
    thumbs.set(filteredCanvas, t);
  }
  return t;
}

/** Grab a mirrored 4:3 frame from the live video. */
export function captureFrame(video: HTMLVideoElement): HTMLCanvasElement | null {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;
  const target = 4 / 3;
  let sw = vw, sh = vh;
  if (vw / vh > target) sw = vh * target;
  else sh = vw / target;
  const sx = (vw - sw) / 2;
  const sy = (vh - sh) / 2;
  const outW = Math.min(1440, Math.round(sw));
  const outH = Math.round(outW / target);
  const c = document.createElement('canvas');
  c.width = outW;
  c.height = outH;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.translate(outW, 0);
  ctx.scale(-1, 1); // match the mirrored preview
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outW, outH);
  registerCapture(c);
  return c;
}
