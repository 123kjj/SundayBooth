import { useEffect, useState } from 'react';
import { FILMS, applyFilm, type FilmId } from '../lib/filters';
import { sampleShots } from '../lib/sample';
import { Bow, FlipPhone, Heart, HeartIcon, Sparkle, Star, Win } from './Art';

const PAPER: Record<FilmId, string> = { classic: '#F2EFEF', pink: '#FADDE5', retro: '#FBF0DC', dreamy: '#DCE8F5' };
const LABEL: Record<FilmId, [string, string]> = {
  classic: ['classic', 'b&w'],
  pink: ['pink', 'flash'],
  retro: ['retro', 'film'],
  dreamy: ['dreamy', 'blue'],
};

function miniStrip(film: FilmId) {
  const shots = sampleShots().map((s, i) => applyFilm(s, film, i + 3));
  const s = 2;
  const W = 116, pad = 9, fw = W - pad * 2, fh = Math.round((fw * 3) / 4), gap = 7;
  const H = pad + 4 * fh + 3 * gap + 58;
  const c = document.createElement('canvas');
  c.width = W * s;
  c.height = H * s;
  const ctx = c.getContext('2d')!;
  ctx.scale(s, s);
  ctx.fillStyle = PAPER[film];
  ctx.fillRect(0, 0, W, H);
  ctx.imageSmoothingQuality = 'high';
  shots.forEach((shot, i) => {
    const y = pad + i * (fh + gap);
    ctx.fillStyle = '#fff';
    ctx.fillRect(pad - 2, y - 2, fw + 4, fh + 4);
    ctx.drawImage(shot, pad, y, fw, fh);
  });
  ctx.fillStyle = '#C25A7D';
  ctx.font = '700 17px "Mali", cursive';
  ctx.textAlign = 'center';
  const [a, b] = LABEL[film];
  const base = pad + 4 * fh + 3 * gap;
  ctx.fillText(a, W / 2, base + 23);
  ctx.fillText(b, W / 2, base + 43);
  return c.toDataURL('image/jpeg', 0.92);
}

interface Props {
  film: FilmId;
  onChange: (f: FilmId) => void;
  onBack: () => void;
  onNext: () => void;
}

const TILT = ['-rotate-3', 'rotate-2', '-rotate-2', 'rotate-3'];

export default function BoothSelect({ film, onChange, onBack, onNext }: Props) {
  const [previews, setPreviews] = useState<Partial<Record<FilmId, string>>>({});
  const current = FILMS.find((f) => f.id === film)!;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await document.fonts?.load('700 17px "Mali"').catch(() => undefined);
      for (const f of FILMS) {
        await new Promise((r) => requestAnimationFrame(r));
        if (cancelled) return;
        const url = miniStrip(f.id);
        setPreviews((p) => ({ ...p, [f.id]: url }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative mx-auto w-full max-w-[1000px]">
      <Win title="choose a film" bodyClassName="relative px-5 pb-7 pt-6 sm:px-10 sm:pt-8">
        <Bow className="absolute left-5 top-4 -rotate-12 max-sm:hidden" size={58} />
        <Heart className="absolute right-8 top-6 rotate-12 max-sm:hidden" size={30} tone="lav" />
        <Star className="absolute right-24 top-14 max-sm:hidden" size={22} />

        <div className="text-center">
          <h2 className="h-hand -rotate-1 text-[32px] sm:text-[42px]">choose your booth!</h2>
          <p className="note mt-1">pick a style for your photos ♡ it shows up in every picture and video</p>
        </div>

        <div role="radiogroup" aria-label="Photo style" className="mt-7 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-4 sm:gap-6">
          {FILMS.map((f, i) => {
            const active = f.id === film;
            return (
              <button
                key={f.id}
                role="radio"
                aria-checked={active}
                aria-label={f.name}
                onClick={() => onChange(f.id)}
                className="group relative flex cursor-pointer flex-col items-center outline-none"
              >
                <span
                  className={`relative block transition-all duration-300 ${TILT[i]} ${
                    active ? '-translate-y-2 scale-[1.04] rotate-0' : 'group-hover:-translate-y-1 group-hover:rotate-0'
                  }`}
                >
                  {active && <Heart className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 animate-rise" size={30} />}
                  {previews[f.id] ? (
                    <img
                      src={previews[f.id]}
                      alt=""
                      className="h-[250px] w-auto rounded-[6px] sm:h-[300px]"
                      style={{
                        boxShadow: active
                          ? '0 0 0 3px #FFFCF9, 0 0 0 6px #E28AA4, 0 16px 24px -12px rgba(194,90,125,0.6)'
                          : '0 0 0 3px #FFFCF9, 0 0 0 4.5px #F2C4D1, 0 12px 18px -12px rgba(194,90,125,0.45)',
                      }}
                    />
                  ) : (
                    <span className="block h-[250px] w-[94px] animate-pulse rounded-[6px] bg-petal sm:h-[300px] sm:w-[113px]" />
                  )}
                </span>
                <span className={`mt-4 font-note text-[18px] leading-tight transition-colors ${active ? 'text-berry' : 'text-plum-soft'}`}>{f.tagline}</span>
              </button>
            );
          })}
        </div>

        <div className="relative mt-8 flex flex-col items-center gap-3">
          <button className="btn btn-pink btn-lg min-w-[220px]" onClick={onNext}>
            use {current.name.toLowerCase()} <HeartIcon size={15} />
          </button>
          <p className="max-w-sm text-center text-[13px] text-plum-soft">
            Next, your browser will ask to use your camera. Nothing is uploaded or saved anywhere.
          </p>
          <button className="link" onClick={onBack}>← back</button>
          <FlipPhone className="absolute -bottom-3 right-0 max-sm:hidden" size={74} />
          <Star className="absolute bottom-2 left-4 -rotate-12 max-sm:hidden" size={30} tone="butter" />
          <Sparkle className="absolute bottom-12 left-16 max-sm:hidden" size={16} tone="blue" />
        </div>
      </Win>
    </section>
  );
}
