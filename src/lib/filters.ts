// Real pixel-level film looks. These run on canvas ImageData so the exact same
// result shows up in thumbnails, the live strip preview and the exported PNG
// (canvas `ctx.filter` is not supported everywhere, so we do the maths ourselves).

export type FilmId = 'classic' | 'pink' | 'retro' | 'dreamy';

type RGB = [number, number, number];

interface FilmParams {
  mono: boolean;
  saturation: number; // 1 = unchanged
  contrast: number; // 1 = unchanged, pivots around mid-grey
  brightness: number; // added, 0–255 scale
  fade: number; // lifts blacks toward this value (0–255)
  shadowTint: RGB; // added in the shadows
  highlightTint: RGB; // added in the highlights
  grain: number; // amplitude of luminance noise
  vignette: number; // 0–1 edge darkening
  vignetteColor?: RGB;
  bloom?: number; // 0–1 soft highlight glow
}

export interface Film {
  id: FilmId;
  name: string;
  tagline: string;
  notes: string[];
  swatch: string; // UI accent
  /** Cheap CSS approximation for the live viewfinder only. */
  cssPreview: string;
  overlay?: { color: string; blend: string; opacity: number };
  params: FilmParams;
}

export const FILMS: Film[] = [
  {
    id: 'classic',
    name: 'Classic B&W',
    tagline: 'the original booth look',
    notes: ['black & white', 'vintage contrast', 'fine film grain'],
    swatch: '#3F3633',
    cssPreview: 'grayscale(1) contrast(1.28) brightness(1.03)',
    params: {
      mono: true, saturation: 0, contrast: 1.3, brightness: 4, fade: 14,
      shadowTint: [2, 0, 0], highlightTint: [4, 2, 0], grain: 22, vignette: 0.32,
    },
  },
  {
    id: 'pink',
    name: 'Pink Flash',
    tagline: 'rosy, glowy, a little dreamy',
    notes: ['soft pink tones', 'warm highlights', 'dreamy bloom'],
    swatch: '#E3909F',
    cssPreview: 'brightness(1.08) contrast(0.9) saturate(1.05)',
    overlay: { color: '#f7a8bb', blend: 'soft-light', opacity: 0.55 },
    params: {
      mono: false, saturation: 0.95, contrast: 0.88, brightness: 12, fade: 26,
      shadowTint: [22, 0, 14], highlightTint: [16, 4, 2], grain: 8, vignette: 0.12, bloom: 0.28,
      vignetteColor: [120, 40, 70],
    },
  },
  {
    id: 'retro',
    name: 'Retro Film',
    tagline: 'like a shoebox of old prints',
    notes: ['warm vintage tones', 'subtle grain', 'faded blacks'],
    swatch: '#E2BF5B',
    cssPreview: 'sepia(0.32) saturate(0.85) contrast(0.95) brightness(1.03)',
    overlay: { color: '#f2c27a', blend: 'soft-light', opacity: 0.45 },
    params: {
      mono: false, saturation: 0.78, contrast: 1.02, brightness: 4, fade: 30,
      shadowTint: [10, 4, -6], highlightTint: [18, 8, -18], grain: 16, vignette: 0.28,
      vignetteColor: [70, 40, 10],
    },
  },
  {
    id: 'dreamy',
    name: 'Dreamy Blue',
    tagline: 'cool, soft, slightly faraway',
    notes: ['cool blue tones', 'soft contrast', 'light vintage fade'],
    swatch: '#84A9CE',
    cssPreview: 'saturate(0.8) contrast(0.88) brightness(1.06) hue-rotate(-6deg)',
    overlay: { color: '#9ec3ea', blend: 'soft-light', opacity: 0.55 },
    params: {
      mono: false, saturation: 0.72, contrast: 0.86, brightness: 8, fade: 28,
      shadowTint: [-18, 2, 30], highlightTint: [-12, 2, 18], grain: 9, vignette: 0.16, bloom: 0.16,
      vignetteColor: [20, 40, 90],
    },
  },
];

export const getFilm = (id: FilmId) => FILMS.find((f) => f.id === id)!;

// Small deterministic PRNG so a photo's grain never changes between renders.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

/**
 * Builds a reusable pixel processor for one film at one size. Photos and video
 * frames both go through this, so stills and clips share exactly the same look.
 * `frame` shifts the grain so it dances in video, like real film.
 */
export function makeFilmProcessor(w: number, h: number, filmId: FilmId, seed = 1) {
  const { params: p } = getFilm(filmId);
  const rand = mulberry32(seed * 9973 + filmId.length * 131);
  const grainScale = Math.max(1, Math.round(w / 640));
  const gw = Math.ceil(w / grainScale);
  const gh = Math.ceil(h / grainScale);
  const grain = new Float32Array(gw * gh);
  for (let i = 0; i < grain.length; i++) grain[i] = (rand() + rand() + rand() - 1.5) * p.grain * 0.9;

  // vignette weight per pixel, computed once
  const vig = new Float32Array(w * h);
  if (p.vignette > 0) {
    const cx = w / 2, cy = h / 2, maxR = Math.sqrt(cx * cx + cy * cy);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const dx = x - cx, dy = y - cy;
        const v = Math.max(0, Math.sqrt(dx * dx + dy * dy) / maxR - 0.45) / 0.55;
        vig[y * w + x] = v * v * p.vignette;
      }
  }
  const vc = p.vignetteColor ?? [0, 0, 0];
  const fadeK = 1 - p.fade / 255;
  const glen = grain.length;

  return (d: Uint8ClampedArray, frame = 0) => {
    const shift = frame ? (frame * 7919) % glen : 0;
    for (let y = 0; y < h; y++) {
      const gy = ((y / grainScale) | 0) * gw;
      for (let x = 0; x < w; x++) {
        const pi = y * w + x;
        const i = pi * 4;
        let r = d[i], g = d[i + 1], b = d[i + 2];
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if (p.mono) r = g = b = lum;
        else if (p.saturation !== 1) {
          r = lum + (r - lum) * p.saturation;
          g = lum + (g - lum) * p.saturation;
          b = lum + (b - lum) * p.saturation;
        }
        r = (r - 128) * p.contrast + 128 + p.brightness;
        g = (g - 128) * p.contrast + 128 + p.brightness;
        b = (b - 128) * p.contrast + 128 + p.brightness;
        const t = lum / 255, s = 1 - t;
        r += p.shadowTint[0] * s + p.highlightTint[0] * t;
        g += p.shadowTint[1] * s + p.highlightTint[1] * t;
        b += p.shadowTint[2] * s + p.highlightTint[2] * t;
        r = p.fade + r * fadeK;
        g = p.fade + g * fadeK;
        b = p.fade + b * fadeK;
        const k = vig[pi];
        if (k > 0) {
          r = r * (1 - k) + vc[0] * k;
          g = g * (1 - k) + vc[1] * k;
          b = b * (1 - k) + vc[2] * k;
        }
        if (p.grain > 0) {
          let gi = gy + ((x / grainScale) | 0) + shift;
          if (gi >= glen) gi -= glen;
          const n = grain[gi] * (0.55 + 0.45 * (1 - Math.abs(t - 0.5) * 2));
          r += n; g += n; b += n;
        }
        d[i] = clamp(r);
        d[i + 1] = clamp(g);
        d[i + 2] = clamp(b);
      }
    }
  };
}

/** Soft bloom: a blurred copy screened on top (downscale/upscale = cheap blur). */
export function applyBloom(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, filmId: FilmId, scratch?: HTMLCanvasElement) {
  const amount = getFilm(filmId).params.bloom;
  if (!amount) return;
  const small = scratch ?? document.createElement('canvas');
  const sw = Math.max(1, Math.round(canvas.width / 14));
  const sh = Math.max(1, Math.round(canvas.height / 14));
  if (small.width !== sw) small.width = sw;
  if (small.height !== sh) small.height = sh;
  const sctx = small.getContext('2d')!;
  sctx.imageSmoothingQuality = 'high';
  sctx.drawImage(canvas, 0, 0, sw, sh);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = amount;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(small, 0, 0, canvas.width, canvas.height);
  ctx.restore();
}

/** Returns a new canvas with the film applied. The source is not modified. */
export function applyFilm(source: HTMLCanvasElement, filmId: FilmId, seed = 1): HTMLCanvasElement {
  const w = source.width, h = source.height;
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(source, 0, 0);
  const img = ctx.getImageData(0, 0, w, h);
  makeFilmProcessor(w, h, filmId, seed)(img.data);
  ctx.putImageData(img, 0, 0);
  applyBloom(ctx, out, filmId);
  return out;
}
