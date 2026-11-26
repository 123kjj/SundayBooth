import { useEffect, useRef, useState } from 'react';
import { getFiltered } from '../lib/photos';
import { loadStripFonts, renderStrip, type StripOptions } from '../lib/strip';
import { drawSticker, type StickerKind } from '../lib/stickers';
import type { FilmId } from '../lib/filters';
import type { Shots } from '../App';

let fontsPromise: Promise<void> | null = null;
export const fontsReady = () => (fontsPromise ??= loadStripFonts());

/** Live strip preview, drawn by the same renderer used for the PNG export. */
export function StripCanvas({
  shots, film, options, date, className = '', scale = 2,
}: { shots: Shots; film: FilmId; options: StripOptions; date: Date; className?: string; scale?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [fonts, setFonts] = useState(false);

  useEffect(() => {
    let alive = true;
    void fontsReady().then(() => alive && setFonts(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const filtered = shots.map((s) => (s ? getFiltered(s, film) : null));
    renderStrip(ref.current, filtered, options, scale, date);
  }, [shots, film, options, date, scale, fonts]);

  return <canvas ref={ref} className={className} role="img" aria-label="Photo strip preview" />;
}

export function StickerIcon({ kind, size = 34 }: { kind: StickerKind; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    c.width = size * dpr;
    c.height = size * dpr;
    const ctx = c.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    drawSticker(ctx, kind, size / 2, size / 2, size * 0.82, 0);
  }, [kind, size]);
  return <canvas ref={ref} style={{ width: size, height: size }} aria-hidden />;
}
