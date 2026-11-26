import { useEffect, useMemo, useRef, useState } from 'react';
import { getFilm, type FilmId } from '../lib/filters';
import { getFiltered } from '../lib/photos';
import { downloadClip } from '../lib/recorder';
import { downloadStrip, layout, renderStrip, stripToBlob, type StripOptions } from '../lib/strip';
import { playDing, playPrinter } from '../lib/sound';
import { Bow, CD, Cherry, Heart, HeartIcon, Printer, RetroTV, Sparkle, Star, Win } from './Art';
import { fontsReady } from './StripCanvas';
import type { Clips, Shots } from '../App';

interface Props {
  film: FilmId;
  shots: Shots;
  clips: Clips;
  options: StripOptions;
  date: Date;
  onAgain: () => void;
  onEdit: () => void;
  onStartOver: () => void;
}

const PRINT_MS = 3200;
const PAPER_W = 104;

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function PrintReveal({ film, shots, clips, options, date, onAgain, onEdit, onStartOver }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<'preparing' | 'printing' | 'done'>('preparing');
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const L = layout(options);
  const paperH = Math.round((PAPER_W * L.height) / L.width);

  // render the strip once, then print it
  useEffect(() => {
    let alive = true;
    let objectUrl: string | null = null;
    let stopSound = () => {};
    const timers: number[] = [];
    (async () => {
      await fontsReady();
      const filtered = shots.map((s) => (s ? getFiltered(s, film) : null));
      const canvas = renderStrip(document.createElement('canvas'), filtered, options, 2, date);
      const blob = await stripToBlob(canvas);
      if (!alive) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
      setPhase('printing');
      stopSound = playPrinter(PRINT_MS / 1000);
      timers.push(
        window.setTimeout(() => {
          if (!alive) return;
          setPhase('done');
          playDing();
        }, PRINT_MS + 500),
      );
    })();
    return () => {
      alive = false;
      stopSound();
      timers.forEach(clearTimeout);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [shots, film, options, date]);

  const download = async () => {
    setSaving('saving');
    try {
      await downloadStrip(shots.map((s) => (s ? getFiltered(s, film) : null)), options, date);
      setSaving('saved');
      setTimeout(() => setSaving('idle'), 2400);
    } catch {
      setSaving('error');
    }
  };

  if (phase !== 'done') {
    return (
      <section className="relative mx-auto w-full max-w-[640px]" aria-live="polite">
        <Win title="printing" bodyClassName="relative overflow-hidden px-6 pb-8 pt-7 text-center">
          <Star className="absolute left-6 top-6 -rotate-12" size={30} />
          <Heart className="absolute right-8 top-10 rotate-12" size={26} tone="rose" />
          <Sparkle className="absolute left-10 top-44" size={18} tone="blue" />
          <Heart className="absolute right-10 top-56 -rotate-6" size={22} tone="lav" />
          <h2 className="h-hand -rotate-1 text-[30px] sm:text-[38px]">printing your memories…</h2>
          <p className="note">just a moment! ♡</p>

          <div className="gingham relative mx-auto mt-6 flex w-full max-w-[420px] flex-col items-center rounded-[24px] px-4 pb-4 pt-4" style={{ border: '2px solid #F3C9D5' }}>
            <Printer className="relative z-10 w-[220px] sm:w-[250px]" active={phase === 'printing'} />
            <div className="relative -mt-[14px] overflow-hidden" style={{ width: PAPER_W + 20, height: paperH + 12 }}>
              {url && (
                <img
                  src={url}
                  alt=""
                  className="absolute left-[10px] top-0 shadow-[0_8px_14px_-6px_rgba(194,90,125,0.45)]"
                  style={{ width: PAPER_W, height: paperH, animation: `printout ${PRINT_MS}ms linear forwards` }}
                />
              )}
            </div>
          </div>

          <div className="relative mx-auto mt-6 h-3.5 w-full max-w-[360px] rounded-full bg-petal" style={{ boxShadow: 'inset 0 1px 2px rgba(110,67,82,.2)' }} role="progressbar" aria-label="Printing">
            {phase === 'printing' && (
              <div className="relative h-full rounded-full bg-dusty" style={{ animation: `progress ${PRINT_MS}ms linear forwards` }}>
                <Heart className="absolute -right-3 top-1/2 -translate-y-1/2" size={26} />
              </div>
            )}
          </div>
        </Win>
      </section>
    );
  }

  return (
    <section className="relative mx-auto w-full max-w-[1060px]">
      <Bow className="absolute -right-4 -top-7 z-10 rotate-12" size={74} />
      <Win title="all done" bodyClassName="relative px-4 pb-8 pt-6 sm:px-10">
        <Star className="absolute left-6 top-6 max-sm:hidden" size={28} />
        <Heart className="absolute left-16 top-16 max-sm:hidden" size={20} tone="lav" />
        <h2 className="h-hand -rotate-1 text-center text-[28px] sm:text-[38px]">your photo session is complete! ♡</h2>
        <p className="note text-center">your strip and your little pose videos are ready</p>

        <div className="mt-5 grid items-start gap-10 md:grid-cols-[auto_minmax(0,1fr)] md:gap-12">
          {/* photo strip */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <span className="tape -top-2 left-1/2 z-10 -translate-x-1/2 rotate-2" />
              <Cherry className="absolute -left-10 top-1/3 z-10 -rotate-12" size={48} />
              <Sparkle className="absolute -right-6 top-10 z-10" size={20} tone="butter" />
              {url && (
                <img
                  src={url}
                  alt="Your finished photo strip"
                  className="w-[210px] -rotate-2 animate-[reveal_0.8s_cubic-bezier(0.2,0.9,0.25,1)_both] drop-shadow-[0_18px_22px_rgba(194,90,125,0.35)] transition-transform duration-300 hover:rotate-0 sm:w-[240px] md:max-h-[calc(100dvh-390px)] md:w-auto"
                />
              )}
            </div>
            <div className="mt-6 flex flex-col items-center gap-2.5">
              <button className="btn btn-pink min-w-[210px]" onClick={download} disabled={saving === 'saving'}>
                {saving === 'saving' ? 'saving…' : saving === 'saved' ? 'saved! ♡' : 'download photos'}
                {saving === 'idle' && <HeartIcon size={14} />}
              </button>
              <button className="btn btn-soft btn-sm min-w-[180px]" onClick={onAgain}>take another set <HeartIcon size={11} /></button>
              {saving === 'error' && <p className="text-sm font-semibold text-berry">Couldn’t save the image. Please try again.</p>}
              <p className="text-center text-[12px] font-semibold text-plum-soft">PNG · {L.width * 3} × {Math.round(L.height * 3)} px</p>
            </div>
          </div>

          {/* videos */}
          <div className="relative flex flex-col items-center">
            <PoseVideos clips={clips} film={film} date={date} />
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button className="btn btn-soft btn-sm" onClick={onStartOver}>start over <HeartIcon size={11} /></button>
              <button className="link" onClick={onEdit}>✎ edit decorations</button>
            </div>
            <RetroTV className="absolute -bottom-6 -right-6 w-[96px] rotate-6 max-lg:hidden" />
            <CD className="absolute -left-10 bottom-2 w-[64px] max-lg:hidden" />
          </div>
        </div>
      </Win>
    </section>
  );
}

function PoseVideos({ clips, film, date }: { clips: Clips; film: FilmId; date: Date }) {
  const available = clips.map((c, i) => (c ? i : -1)).filter((i) => i >= 0);
  const [index, setIndex] = useState(available[0] ?? 0);
  const clip = clips[index];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [saved, setSaved] = useState(false);

  const src = useMemo(() => (clip ? URL.createObjectURL(clip.blob) : null), [clip]);
  useEffect(() => () => void (src && URL.revokeObjectURL(src)), [src]);

  const duration = clip?.duration ?? 3;

  const play = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.ended || time >= duration - 0.05) v.currentTime = 0;
    void v.play().catch(() => undefined);
  };
  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) play();
    else v.pause();
  };
  const again = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    void v.play().catch(() => undefined);
  };

  // autoplay each newly chosen clip once
  useEffect(() => {
    setTime(0);
    const v = videoRef.current;
    if (v && src) {
      v.load();
      void v.play().catch(() => undefined);
    }
  }, [src]);

  const fmt = (s: number) => `0:${String(Math.min(59, Math.floor(s))).padStart(2, '0')}`;

  if (!available.length) {
    return (
      <Win title="pose video" className="w-full max-w-[520px]" bodyClassName="dots flex aspect-[4/3] flex-col items-center justify-center gap-2 p-6 text-center">
        <Heart size={36} tone="lav" />
        <p className="h-hand text-[24px]">no videos this time</p>
        <p className="max-w-xs text-[13px] text-plum-soft">This browser can’t record video, so only your photos were saved. Chrome, Edge, Firefox and Safari 18+ can.</p>
      </Win>
    );
  }

  return (
    <div className="w-full max-w-[540px]">
      <Win title={`pose video · ${index + 1} of 4`} bodyClassName="p-3">
        <div className="group relative aspect-[4/3] overflow-hidden rounded-[14px] bg-[#3a2a31]" style={{ boxShadow: '0 0 0 4px #FFFCF9, 0 0 0 5.5px #F2C4D1' }}>
          {src && (
            <video
              ref={videoRef}
              src={src}
              playsInline
              muted
              preload="auto"
              className="h-full w-full cursor-pointer object-cover"
              onClick={toggle}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
              aria-label={`Pose ${index + 1} video`}
            />
          )}
          {!playing && (
            <button onClick={play} className="absolute inset-0 flex cursor-pointer items-center justify-center bg-[#3a2a31]/15" aria-label="Play video">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-berry shadow-[0_6px_18px_rgba(110,67,82,0.35)] transition-transform hover:scale-105">
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
              </span>
            </button>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 bg-[#3a2a31]/45 px-3 py-2 text-[11px] font-bold text-white">
            <button onClick={toggle} className="cursor-pointer" aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? (
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d="M2 1h3v10H2zM7 1h3v10H7z" fill="currentColor" /></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d="M2 1l9 5-9 5z" fill="currentColor" /></svg>
              )}
            </button>
            <span className="tabular-nums">{fmt(time)} / {fmt(duration)}</span>
            <span className="relative h-1 flex-1 rounded-full bg-white/35">
              <span className="absolute inset-y-0 left-0 rounded-full bg-petal" style={{ width: `${Math.min(100, (time / duration) * 100)}%` }} />
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 px-1">
          <div className="flex gap-1.5" role="radiogroup" aria-label="Choose pose video">
            {clips.map((c, i) => (
              <button
                key={i}
                role="radio"
                aria-checked={i === index}
                disabled={!c}
                onClick={() => setIndex(i)}
                className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full font-hand text-[15px] font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                  i === index ? 'bg-dusty text-white shadow-[0_2px_0_#C9637F]' : 'bg-blush text-berry hover:bg-petal'
                }`}
                aria-label={`Pose ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          {clip && clip.film !== film && <span className="note text-[15px]">filmed in {getFilm(clip.film).name}</span>}
        </div>
      </Win>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button
          className="btn btn-pink"
          disabled={!clip}
          onClick={() => {
            if (!clip) return;
            downloadClip(clip, `sunday-booth-pose-${index + 1}-${ymd(date)}`);
            setSaved(true);
            setTimeout(() => setSaved(false), 2200);
          }}
        >
          {saved ? 'saved! ♡' : 'download video'} {!saved && <HeartIcon size={14} />}
        </button>
        <button className="btn btn-soft" onClick={again} disabled={!clip}>watch again <HeartIcon size={13} /></button>
      </div>
      <p className="mt-2 text-center text-[12px] font-semibold text-plum-soft">
        {clip ? `${clip.ext.toUpperCase()} · 640 × 480 · about ${Math.round(clip.duration)} seconds` : ''}
      </p>
    </div>
  );
}
