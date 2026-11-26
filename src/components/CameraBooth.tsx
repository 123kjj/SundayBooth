import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { FILMS, getFilm, type FilmId } from '../lib/filters';
import { captureFrame, getFiltered, getThumb } from '../lib/photos';
import { canRecord, startClip, type ClipRecorder } from '../lib/recorder';
import { playShutter, playTick } from '../lib/sound';
import { useCamera } from '../lib/useCamera';
import { Badge, Bow, Cherry, Heart, HeartIcon, Sparkle, Star, Win } from './Art';
import type { Clips, Shots } from '../App';

interface Props {
  film: FilmId;
  onFilmChange: (f: FilmId) => void;
  shots: Shots;
  onShotsChange: Dispatch<SetStateAction<Shots>>;
  clips: Clips;
  onClipsChange: Dispatch<SetStateAction<Clips>>;
  onBack: () => void;
  onDone: () => void;
}

const COUNT_FROM = 3;
const CHEERS = ['get ready!', 'next pose!', 'make a silly face!', 'last one, big smile!'];

export default function CameraBooth({ film, onFilmChange, shots, onShotsChange, clips, onClipsChange, onBack, onDone }: Props) {
  const cam = useCamera();
  const f = getFilm(film);
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  const [cheer, setCheer] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const runRef = useRef(0);
  const recRef = useRef<ClipRecorder | null>(null);
  const recordingSupported = useRef(canRecord()).current;

  const filled = shots.filter(Boolean).length;
  const complete = filled === 4;
  const ready = cam.status === 'ready';

  const cancel = useCallback(() => {
    runRef.current++;
    recRef.current?.cancel();
    recRef.current = null;
    setRunning(false);
    setCount(null);
    setActive(null);
    setCheer(null);
  }, []);

  // stop countdowns and recordings if we leave or the camera drops
  useEffect(
    () => () => {
      runRef.current++;
      recRef.current?.cancel();
    },
    [],
  );
  useEffect(() => {
    if (cam.status !== 'ready') cancel();
  }, [cam.status, cancel]);

  const run = useCallback(
    async (indices: number[]) => {
      const token = ++runRef.current;
      const alive = () => token === runRef.current;
      const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
      setRunning(true);
      setSelected(null);
      for (let k = 0; k < indices.length; k++) {
        const idx = indices[k];
        setActive(idx);
        setCheer(indices.length === 1 ? 'retake time!' : CHEERS[Math.min(k, 3)]);
        await wait(k === 0 ? 900 : 700);
        if (!alive()) return;

        // record this pose's countdown as a short clip
        const video = cam.videoRef.current;
        const rec = video ? startClip(video, film) : null;
        recRef.current = rec;

        for (let n = COUNT_FROM; n >= 1; n--) {
          setCount(n);
          playTick(n === 1);
          await wait(1000);
          if (!alive()) return;
        }
        setCount(null);
        const frame = video ? captureFrame(video) : null;
        if (!frame) {
          cancel();
          return;
        }
        rec?.flash();
        playShutter();
        setFlashKey((x) => x + 1);
        getFiltered(frame, film); // warm the cache so the thumbnail appears instantly
        onShotsChange((prev) => prev.map((s, i) => (i === idx ? frame : s)));

        await wait(220); // keep the flash in the clip
        const clip = rec ? await rec.stop() : null;
        recRef.current = null;
        if (!alive()) return;
        onClipsChange((prev) => prev.map((c, i) => (i === idx ? clip : c)));
        await wait(450);
        if (!alive()) return;
      }
      setActive(null);
      setRunning(false);
      setCheer(null);
    },
    [cam.videoRef, cancel, film, onShotsChange, onClipsChange],
  );

  const startSession = () => {
    if (!ready || running) return;
    if (complete) {
      onShotsChange([null, null, null, null]);
      onClipsChange([null, null, null, null]);
      void run([0, 1, 2, 3]);
    } else {
      void run([0, 1, 2, 3].filter((i) => !shots[i]));
    }
  };

  const retake = () => {
    if (!ready || running) return;
    if (selected !== null) void run([selected]);
    else startSession();
  };

  const restart = () => {
    cancel();
    setSelected(null);
    onShotsChange([null, null, null, null]);
    onClipsChange([null, null, null, null]);
  };

  // space bar starts the session
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || (e.target as HTMLElement)?.closest('button, select, input')) return;
      e.preventDefault();
      if (!running) startSession();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const sessionLabel = complete ? 'retake all four' : filled > 0 ? `continue · ${4 - filled} left` : 'start session';

  let status = 'ready when you are ♡';
  let sub = `4 photos · ${COUNT_FROM} second countdown each`;
  if (cam.status === 'requesting') [status, sub] = ['warming up the booth…', 'say yes to the camera when your browser asks'];
  else if (running) [status, sub] = [cheer ?? (count ? `${count}…` : 'snap!'), `pose ${active! + 1} of 4 · ${COUNT_FROM} second countdown…`];
  else if (complete) [status, sub] = ['all done! ♡', 'tap a photo to retake it, or go decorate'];
  else if (filled) [status, sub] = ['almost there!', `${4 - filled} more to go`];

  return (
    <section className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-8">
      {/* camera window */}
      <div className="relative">
        <Bow className="absolute -left-5 -top-7 z-10 -rotate-12" size={58} tone="lav" />
        <Win title="sunday booth" barClassName="pl-14" bodyClassName="p-3 sm:p-4">
          <div role="radiogroup" aria-label="Film" className="mb-3 grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:justify-center">
            {FILMS.map((x) => (
              <button
                key={x.id}
                role="radio"
                aria-checked={x.id === film}
                disabled={running}
                onClick={() => onFilmChange(x.id)}
                className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-all disabled:cursor-not-allowed ${
                  x.id === film ? 'bg-dusty text-white shadow-[0_2px_0_#C9637F]' : 'bg-paper text-plum-soft hover:text-berry'
                }`}
                style={x.id === film ? undefined : { border: '1.5px solid #F2C4D1' }}
              >
                <span className="h-2 w-2 rounded-full ring-2 ring-white/70" style={{ background: x.swatch }} />
                {x.name}
              </button>
            ))}
          </div>

          <div
            className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-[#3a2a31] lg:max-w-[calc((100dvh-360px)*4/3)]"
            style={{ boxShadow: '0 0 0 5px #FFFCF9, 0 0 0 7px #F2C4D1' }}
          >
            <video
              ref={cam.videoRef}
              playsInline
              muted
              autoPlay
              className={`absolute inset-0 h-full w-full -scale-x-100 object-cover transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
              style={{ filter: f.cssPreview }}
            />
            {f.overlay && ready && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: f.overlay.color, mixBlendMode: f.overlay.blend as React.CSSProperties['mixBlendMode'], opacity: f.overlay.opacity }}
              />
            )}
            {ready && (
              <>
                <Heart className="pointer-events-none absolute left-4 top-4 -rotate-12" size={30} tone="lav" />
                <Sparkle className="pointer-events-none absolute right-5 top-5" size={22} tone="butter" />
                <Star className="pointer-events-none absolute bottom-4 left-5 rotate-12" size={24} tone="blue" />
                {running && (
                  <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-bold text-berry">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#E5547A]" /> {count !== null && recordingSupported ? 'rec' : 'pose'} {active! + 1}/4
                  </span>
                )}
              </>
            )}

            {count !== null && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-live="assertive">
                <span
                  key={`${active}-${count}`}
                  className="animate-pop font-display text-[150px] font-bold leading-none sm:text-[210px]"
                  style={{
                    color: '#FFFCF9',
                    WebkitTextStroke: '9px #EE8FAB',
                    paintOrder: 'stroke fill',
                    filter: 'drop-shadow(0 6px 0 #D46E8C) drop-shadow(0 14px 24px rgba(110,67,82,0.35))',
                  }}
                >
                  {count}
                </span>
              </div>
            )}

            {flashKey > 0 && <div key={flashKey} className="pointer-events-none absolute inset-0 animate-flash bg-white" />}

            {cam.status === 'requesting' && (
              <Overlay>
                <span className="mb-4 h-10 w-10 animate-spin rounded-full border-[4px] border-rose/40 border-t-rose" />
                <p className="h-hand text-[28px] !text-petal">warming up the booth…</p>
                <p className="mt-1 max-w-xs text-sm text-petal/80">If your browser asks, choose “Allow” so the booth can see you.</p>
              </Overlay>
            )}
            {cam.status === 'paused' && (
              <Overlay>
                <p className="h-hand text-[28px] !text-petal">camera paused</p>
                <p className="mt-1 max-w-xs text-sm text-petal/80">We turn the camera off when you switch tabs.</p>
                <button className="btn btn-pink mt-5" onClick={() => cam.start()}>turn it back on</button>
              </Overlay>
            )}
            {cam.status === 'error' && cam.error && (
              <Overlay>
                <Heart size={42} tone="lav" className="mb-2 -rotate-12" />
                <p className="h-hand text-[28px] !text-petal">{cam.error.title}</p>
                <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-petal/85">{cam.error.message}</p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  {cam.error.kind !== 'unsupported' && cam.error.kind !== 'insecure' && (
                    <button className="btn btn-pink" onClick={() => cam.start()}>try again</button>
                  )}
                  <button className="link !text-petal hover:!bg-white/10" onClick={onBack}>← choose a film</button>
                </div>
              </Overlay>
            )}
          </div>

          <div className="mt-5 text-center" aria-live="polite">
            <p className="h-hand text-[24px]">{status}</p>
            <p className="text-[13px] font-semibold text-plum-soft">{sub}</p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-between">
            <div className="flex items-center gap-2">
              {running ? (
                <button className="btn btn-soft" onClick={cancel}>
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-berry" /> stop
                </button>
              ) : (
                <button className="btn btn-pink" onClick={startSession} disabled={!ready}>
                  <span className="h-2.5 w-2.5 rounded-full bg-white" /> {sessionLabel}
                </button>
              )}
              {filled > 0 && !running && <button className="link" onClick={restart}>↺ restart</button>}
            </div>
            <div className="flex items-center gap-2">
              {cam.devices.length > 1 && (
                <label className="flex items-center gap-2 text-[13px] font-bold text-plum-soft">
                  <span className="sr-only sm:not-sr-only">camera</span>
                  <select
                    className="max-w-[190px] cursor-pointer truncate rounded-full bg-paper px-3 py-2 text-[13px] font-semibold text-plum disabled:opacity-50"
                    style={{ border: '1.5px solid #F2C4D1' }}
                    value={cam.deviceId}
                    disabled={running}
                    onChange={(e) => cam.selectDevice(e.target.value)}
                  >
                    {cam.devices.map((d, i) => (
                      <option key={d.deviceId || i} value={d.deviceId}>
                        {d.label || `Camera ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {!running && ready && <span className="note hidden text-[16px] xl:inline">or press space ♡</span>}
            </div>
          </div>
        </Win>
      </div>

      {/* photos window */}
      <div className="relative">
        <Star className="absolute -right-3 -top-5 z-10 rotate-12" size={34} />
        <Win title="your photos" bodyClassName="relative px-4 pb-5 pt-4">
          <p className="h-hand mb-3 text-center text-[26px]">
            3… 2… 1… <HeartIcon size={18} className="inline -translate-y-0.5" />
          </p>
          <ol className="grid grid-cols-4 gap-2.5 lg:grid-cols-2">
            {shots.map((s, i) => {
              const thumb = s ? getThumb(getFiltered(s, film)) : null;
              const isActive = active === i;
              const isSel = selected === i;
              return (
                <li key={i} className={i % 2 ? 'rotate-[1.5deg]' : '-rotate-[1.5deg]'}>
                  <button
                    disabled={!thumb || running}
                    onClick={() => setSelected(isSel ? null : i)}
                    aria-pressed={isSel}
                    aria-label={thumb ? `Photo ${i + 1}${isSel ? ', selected for retake' : ''}` : `Photo ${i + 1}, not taken yet`}
                    className="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-[10px] bg-paper p-[4px] transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-default"
                    style={{
                      boxShadow: isSel || isActive ? '0 0 0 3px #E28AA4, 0 8px 14px -8px rgba(194,90,125,0.7)' : '0 0 0 1.5px #F2C4D1, 0 6px 12px -8px rgba(194,90,125,0.5)',
                    }}
                  >
                    {thumb ? (
                      <img src={thumb} alt="" className="h-full w-full animate-rise rounded-[7px] object-cover" />
                    ) : (
                      <span className={`dots flex h-full w-full items-center justify-center rounded-[7px] bg-blush ${isActive ? 'animate-pulse' : ''}`}>
                        <span className="font-hand text-[20px] font-bold text-rose">{i + 1}</span>
                      </span>
                    )}
                    {clips[i] && (
                      <span className="absolute bottom-1.5 left-1.5 hidden items-center gap-1 rounded-full bg-white/90 px-1.5 py-[1px] text-[10px] font-bold text-berry sm:flex">
                        <svg width="8" height="8" viewBox="0 0 10 10" aria-hidden><path d="M2 1l7 4-7 4z" fill="currentColor" /></svg> 3s
                      </span>
                    )}
                    {isSel && <Heart className="absolute -right-1 -top-1" size={22} />}
                  </button>
                </li>
              );
            })}
          </ol>

          {complete && !running && <Badge className="absolute -left-5 bottom-24 -rotate-12 max-lg:hidden">so<br />cute!</Badge>}

          <div className="mt-5 flex flex-col items-center gap-2.5">
            <button className="btn btn-soft btn-sm min-w-[150px]" onClick={retake} disabled={!ready || running || filled === 0}>
              ↺ {selected !== null ? `retake #${selected + 1}` : 'retake all'} <HeartIcon size={11} />
            </button>
            <button className="btn btn-pink btn-lg w-full max-w-[240px]" disabled={!complete || running} onClick={onDone}>
              next <HeartIcon size={15} />
            </button>
            <p className="note mt-1 text-center text-[16px]">
              {complete ? 'tap a photo, then retake ♡' : 'photos appear here as you take them'}
            </p>
            {!recordingSupported && <p className="text-center text-[12px] text-plum-soft">This browser can’t record video, so only photos will be saved.</p>}
          </div>
          <Cherry className="absolute -bottom-4 -right-4 rotate-12" size={48} />
        </Win>
      </div>
    </section>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return <div className="absolute inset-0 flex animate-rise flex-col items-center justify-center bg-[#3a2a31]/95 p-6 text-center text-petal">{children}</div>;
}
