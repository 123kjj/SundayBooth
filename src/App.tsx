import { useCallback, useEffect, useRef, useState } from 'react';
import type { FilmId } from './lib/filters';
import type { Clip } from './lib/recorder';
import { DEFAULT_OPTIONS, type StripOptions } from './lib/strip';
import { isSoundOn, setSoundOn } from './lib/sound';
import { track } from './lib/analytics';
import { HeartIcon, Logo, Win } from './components/Art';
import Landing from './components/Landing';
import BoothSelect from './components/BoothSelect';
import CameraBooth from './components/CameraBooth';
import Customize from './components/Customize';
import PrintReveal from './components/PrintReveal';

export type Screen = 'landing' | 'select' | 'camera' | 'customize' | 'print';
const STEPS: { id: Screen; label: string }[] = [
  { id: 'select', label: 'film' },
  { id: 'camera', label: 'pose' },
  { id: 'customize', label: 'decorate' },
  { id: 'print', label: 'print' },
];

export type Shots = (HTMLCanvasElement | null)[];
export type Clips = (Clip | null)[];
const empty = <T,>(): T[] => [null, null, null, null] as T[];

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [film, setFilm] = useState<FilmId>('classic');
  const [shots, setShots] = useState<Shots>(empty);
  const [clips, setClips] = useState<Clips>(empty);
  const [options, setOptions] = useState<StripOptions>(DEFAULT_OPTIONS);
  const [date, setDate] = useState(() => new Date());
  const [sound, setSound] = useState(isSoundOn);

  const go = useCallback((s: Screen) => {
    setScreen(s);
    track('booth_step', { step: s });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleSound = () => {
    setSoundOn(!sound);
    setSound(!sound);
    track('sound_toggle', { sound_on: !sound });
  };

  const newSet = () => {
    track('take_another_set');
    setShots(empty());
    setClips(empty());
    setDate(new Date());
    go('camera');
  };
  const startOver = () => {
    track('start_over');
    setShots(empty());
    setClips(empty());
    setOptions(DEFAULT_OPTIONS);
    setFilm('classic');
    go('landing');
  };

  const stepIndex = STEPS.findIndex((s) => s.id === screen);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 pt-5 sm:px-8">
        <button onClick={startOver} className="cursor-pointer transition-transform hover:-rotate-2" aria-label="Sunday Booth, back to start">
          {screen === 'landing' ? <span className="chip"><HeartIcon size={12} /> welcome in</span> : <Logo size="sm" />}
        </button>

        {stepIndex >= 0 && (
          <ol className="hidden items-center gap-1.5 md:flex" aria-label="Progress">
            {STEPS.map((s, i) => (
              <li key={s.id} className="flex items-center gap-1.5">
                <span
                  aria-current={i === stepIndex ? 'step' : undefined}
                  className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-[13px] font-bold transition-colors ${
                    i === stepIndex ? 'bg-dusty text-white shadow-[0_2px_0_#C9637F]' : i < stepIndex ? 'bg-paper/80 text-berry' : 'text-plum-soft/70'
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full font-hand text-[12px] ${i === stepIndex ? 'bg-white/30' : 'bg-petal'}`}>{i + 1}</span>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && <span className="font-hand text-rose">·</span>}
              </li>
            ))}
          </ol>
        )}

        <div className="flex items-center gap-2">
          <About />
          <button onClick={toggleSound} className="chip cursor-pointer hover:bg-petal" aria-pressed={sound} title={sound ? 'Turn sounds off' : 'Turn sounds on'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 18V5l11-2v13" />
              <circle cx="6.5" cy="18" r="2.5" fill="currentColor" />
              <circle cx="17.5" cy="16" r="2.5" fill="currentColor" />
              {!sound && <path d="M3 3l18 18" />}
            </svg>
            <span className="hidden sm:inline">{sound ? 'sound on' : 'sound off'}</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-12 pt-6 sm:px-8 sm:pt-8">
        <div key={screen} className="screen flex flex-1 flex-col">
          {screen === 'landing' && <Landing onStart={() => go('select')} />}
          {screen === 'select' && <BoothSelect film={film} onChange={setFilm} onBack={() => go('landing')} onNext={() => go('camera')} />}
          {screen === 'camera' && (
            <CameraBooth
              film={film}
              onFilmChange={setFilm}
              shots={shots}
              onShotsChange={setShots}
              clips={clips}
              onClipsChange={setClips}
              onBack={() => go('select')}
              onDone={() => go('customize')}
            />
          )}
          {screen === 'customize' && (
            <Customize film={film} shots={shots} options={options} onChange={setOptions} date={date} onBack={() => go('camera')} onPrint={() => go('print')} />
          )}
          {screen === 'print' && (
            <PrintReveal
              film={film}
              shots={shots}
              clips={clips}
              options={options}
              date={date}
              onAgain={newSet}
              onEdit={() => go('customize')}
              onStartOver={startOver}
            />
          )}
        </div>
      </main>

      <footer className="relative mt-auto">
        <svg className="block h-3 w-full text-[#FDF2F5]" preserveAspectRatio="none" viewBox="0 0 120 6" aria-hidden>
          <path d="M0 6V3Q3 0 6 3T12 3T18 3T24 3T30 3T36 3T42 3T48 3T54 3T60 3T66 3T72 3T78 3T84 3T90 3T96 3T102 3T108 3T114 3T120 3V6Z" fill="currentColor" />
        </svg>
        <div className="gingham px-5 pb-5 pt-3">
          <p className="mx-auto w-fit rounded-full bg-paper/90 px-4 py-1.5 text-center font-note text-[17px] text-plum-soft">
            your photos & videos are made in your browser and never uploaded ♡ no accounts needed
          </p>
        </div>
      </footer>
    </div>
  );
}

function About() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button className="chip cursor-pointer hover:bg-petal" aria-expanded={open} onClick={() => setOpen(!open)}>
        <HeartIcon size={12} /> about
      </button>
      {open && (
        <Win title="about" className="absolute right-0 top-11 w-[290px] animate-rise" bodyClassName="p-4 text-[14px] leading-relaxed">
          <p>
            <b className="text-berry">Sunday Booth</b> is a tiny photo studio in your browser. Pick a film, pose for four photos, decorate your strip
            and print it.
          </p>
          <p className="mt-2">Each pose also saves a 3-second video. Your photos and videos stay on your device and are gone when you close the tab.</p>
          <p className="mt-2 text-[13px] text-plum-soft">We count anonymous visits (like which step people reach) with Google Analytics. It never sees your pictures.</p>
          <p className="note mt-2">press space on the camera screen to start ♡</p>
        </Win>
      )}
    </div>
  );
}
