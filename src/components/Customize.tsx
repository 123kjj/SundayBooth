import type { ReactNode } from 'react';
import type { FilmId } from '../lib/filters';
import { BACKGROUNDS, BORDERS, MAX_STICKERS, PATTERNS, PRESETS, type CaptionFont, type Pattern, type StripOptions } from '../lib/strip';
import { STICKERS, STICKER_KINDS } from '../lib/stickers';
import { Bow, Cherry, DoodleArrow, Heart, HeartIcon, Sparkle, Star, Win } from './Art';
import { StickerIcon, StripCanvas } from './StripCanvas';
import { track } from '../lib/analytics';
import type { Shots } from '../App';

interface Props {
  film: FilmId;
  shots: Shots;
  options: StripOptions;
  onChange: (o: StripOptions) => void;
  date: Date;
  onBack: () => void;
  onPrint: () => void;
}

const FONTS: { id: CaptionFont; label: string; cls: string }[] = [
  { id: 'hand', label: 'cute', cls: 'font-hand text-[17px] font-bold leading-none' },
  { id: 'serif', label: 'Serif', cls: 'font-display text-[14px] font-semibold' },
  { id: 'mono', label: 'TYPE', cls: 'font-mono text-[12px] tracking-wider' },
];

export default function Customize({ film, shots, options: o, onChange, date, onBack, onPrint }: Props) {
  const set = <K extends keyof StripOptions>(k: K, v: StripOptions[K]) => onChange({ ...o, [k]: v });
  const activePreset = PRESETS.find((p) =>
    (Object.keys(p.options) as (keyof typeof p.options)[]).every((k) => JSON.stringify(p.options[k]) === JSON.stringify(o[k])),
  );

  return (
    <section className="relative mx-auto w-full max-w-[1080px]">
      <Win title="decorate" bodyClassName="relative p-4 sm:p-8">
        <div className="mb-6 text-center md:text-left">
          <h2 className="h-hand -rotate-1 text-[30px] sm:text-[38px]">customize your strip ♡</h2>
          <p className="note">make it your own! every change shows up right away</p>
        </div>

        <div className="grid items-start gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10">
          {/* live preview on a gingham mat */}
          <div className="md:sticky md:top-6">
            <div className="gingham relative flex justify-center rounded-[24px] px-6 py-9" style={{ border: '2px solid #F3C9D5', boxShadow: 'inset 0 0 0 5px #FFFCF9' }}>
              <span className="tape -top-2 left-1/2 -translate-x-1/2 -rotate-3" />
              <Bow className="absolute -left-4 top-10 -rotate-12" size={54} tone="blue" />
              <Cherry className="absolute -right-3 bottom-16 rotate-12" size={46} />
              <Star className="absolute right-5 top-6" size={24} />
              <Sparkle className="absolute bottom-6 left-6" size={18} />
              <StripCanvas
                shots={shots}
                film={film}
                options={o}
                date={date}
                className="relative h-auto w-full max-w-[220px] -rotate-1 drop-shadow-[0_16px_18px_rgba(194,90,125,0.3)] sm:max-w-[250px] md:max-h-[calc(100dvh-280px)] md:w-auto"
              />
              <span className="note absolute bottom-2 right-5 flex items-center gap-1 text-[15px]">
                <DoodleArrow className="h-6 w-8 rotate-[150deg]" /> live preview
              </span>
            </div>
          </div>

          {/* controls */}
          <div className="flex flex-col gap-4">
            <Panel title="quick themes" hint="start here ♡">
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onChange({ ...o, ...p.options })}
                    aria-pressed={activePreset?.id === p.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[13px] font-bold transition-all hover:-translate-y-0.5 ${
                      activePreset?.id === p.id ? 'bg-dusty text-white shadow-[0_2px_0_#C9637F]' : 'bg-paper text-plum'
                    }`}
                    style={activePreset?.id === p.id ? undefined : { border: '1.5px solid #F2C4D1' }}
                  >
                    <span className={`relative h-6 w-6 overflow-hidden rounded-full ${p.options.pattern === 'gingham' ? 'gingham' : ''}`} style={{ background: p.options.pattern === 'gingham' ? undefined : p.options.background, boxShadow: 'inset 0 0 0 1.5px rgba(110,67,82,.15)' }}>
                      <span className="absolute inset-[7px] rounded-[3px]" style={{ background: p.options.borderColor, boxShadow: '0 0 0 1px rgba(110,67,82,.2)' }} />
                    </span>
                    {p.name}
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="background color">
              <Swatches colors={BACKGROUNDS} value={o.background} onChange={(v) => set('background', v)} label="Strip background" shape="circle" />
              <div className="mt-3">
                <Segmented value={o.pattern} onChange={(v) => set('pattern', v as Pattern)} items={PATTERNS.map((p) => ({ id: p.id, label: p.label }))} />
              </div>
            </Panel>

            <Panel title="border style">
              <Swatches colors={BORDERS} value={o.borderColor} onChange={(v) => set('borderColor', v)} label="Frame colour" shape="square" />
              <div className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <Slider label="thickness" min={0} max={12} value={o.borderWidth} onChange={(v) => set('borderWidth', v)} />
                <Slider label="photo spacing" min={6} max={32} value={o.spacing} onChange={(v) => set('spacing', v)} />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-[13px] font-semibold text-plum-soft">corners</span>
                <Segmented
                  value={o.rounded ? 'round' : 'square'}
                  onChange={(v) => set('rounded', v === 'round')}
                  items={[
                    { id: 'round', label: <><span className="h-3.5 w-3.5 rounded-[5px] border-2 border-current" /> rounded</> },
                    { id: 'square', label: <><span className="h-3.5 w-3.5 border-2 border-current" /> square</> },
                  ]}
                />
              </div>
            </Panel>

            <Panel
              title="stickers"
              hint={`${o.stickers.length}/${MAX_STICKERS}`}
              aside={
                o.stickers.length > 0 && (
                  <span className="flex gap-0.5">
                    <button className="link !py-0.5 !text-[13px]" onClick={() => set('shuffle', (o.shuffle + 1) % 10)}>⤨ shuffle</button>
                    <button className="link !py-0.5 !text-[13px]" onClick={() => set('stickers', [])}>clear</button>
                  </span>
                )
              }
            >
              <div className="grid grid-cols-8 gap-1.5">
                {STICKER_KINDS.map((k) => (
                  <button
                    key={k}
                    title={`Add ${STICKERS[k].label}`}
                    aria-label={`Add ${STICKERS[k].label} sticker`}
                    disabled={o.stickers.length >= MAX_STICKERS}
                    onClick={() => set('stickers', [...o.stickers, k])}
                    className="flex aspect-square cursor-pointer items-center justify-center rounded-xl bg-blush/60 transition-transform hover:-translate-y-0.5 hover:-rotate-6 hover:bg-petal active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <StickerIcon kind={k} size={32} />
                  </button>
                ))}
              </div>
              <div className="mt-2.5 flex min-h-8 flex-wrap items-center gap-1.5">
                {o.stickers.length === 0 && <span className="note text-[16px]">tap a sticker to add it, tap again for more</span>}
                {o.stickers.map((k, i) => (
                  <button
                    key={`${k}-${i}`}
                    onClick={() => set('stickers', o.stickers.filter((_, j) => j !== i))}
                    className="group flex cursor-pointer items-center gap-0.5 rounded-full bg-paper py-0.5 pl-0.5 pr-2 text-xs font-bold text-plum-soft hover:bg-petal"
                    style={{ border: '1.5px solid #F2C4D1' }}
                    aria-label={`Remove ${STICKERS[k].label}`}
                  >
                    <StickerIcon kind={k} size={22} />
                    <span className="group-hover:text-berry">×</span>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="text">
              <input
                type="text"
                value={o.caption}
                maxLength={28}
                onChange={(e) => set('caption', e.target.value)}
                placeholder="write a little note…"
                className="w-full rounded-full bg-paper px-4 py-2.5 text-[15px] font-semibold text-plum outline-none transition-shadow placeholder:font-medium placeholder:text-plum-soft/60 focus:shadow-[0_0_0_3px_#F9D7E0]"
                style={{ border: '1.5px solid #F2C4D1' }}
                aria-label="Caption text"
              />
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Segmented value={o.captionFont} onChange={(v) => set('captionFont', v as CaptionFont)} items={FONTS.map((f) => ({ id: f.id, label: <span className={f.cls}>{f.label}</span> }))} />
                <Toggle label="date stamp" checked={o.showDate} onChange={(v) => set('showDate', v)} />
                <Toggle label="squiggle" checked={o.doodle} onChange={(v) => set('doodle', v)} />
              </div>
            </Panel>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <button className="btn btn-soft" onClick={onBack}>← back</button>
              <button
                className="btn btn-pink btn-lg"
                onClick={() => {
                  track('strip_printed', {
                    film,
                    theme: activePreset?.id ?? 'custom',
                    stickers: o.stickers.length,
                    has_caption: Boolean(o.caption.trim()),
                  });
                  onPrint();
                }}
              >
                print my memories <HeartIcon size={15} />
              </button>
            </div>
          </div>
        </div>
        <Heart className="absolute -bottom-4 -left-3 -rotate-12" size={34} tone="lav" />
      </Win>
    </section>
  );
}

function Panel({ title, hint, aside, children }: { title: string; hint?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="panel">
      <div className="mb-2.5 flex min-h-6 items-center justify-between gap-2">
        <p className="flex items-baseline gap-2">
          <span className="label">{title}</span>
          {hint && <span className="note text-[15px]">{hint}</span>}
        </p>
        {aside}
      </div>
      {children}
    </div>
  );
}

function Swatches({ colors, value, onChange, label, shape }: { colors: string[]; value: string; onChange: (v: string) => void; label: string; shape: 'circle' | 'square' }) {
  const custom = !colors.some((c) => c.toLowerCase() === value.toLowerCase());
  const r = shape === 'circle' ? 'rounded-full' : 'rounded-[9px]';
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
      {colors.map((c) => {
        const on = c.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={c}
            role="radio"
            aria-checked={on}
            aria-label={c}
            onClick={() => onChange(c)}
            className={`h-8 w-8 cursor-pointer ${r} transition-transform hover:scale-110 ${on ? 'scale-110' : ''}`}
            style={{
              background: c,
              boxShadow: on ? '0 0 0 2px #FFFCF9, 0 0 0 4.5px #E28AA4' : 'inset 0 0 0 1.5px rgba(110,67,82,0.15)',
            }}
          />
        );
      })}
      <label
        className={`relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden ${r} text-berry transition-transform hover:scale-110`}
        style={custom ? { background: value, boxShadow: '0 0 0 2px #FFFCF9, 0 0 0 4.5px #E28AA4' } : { border: '1.5px dashed #E28AA4' }}
        title="Custom colour"
      >
        {!custom && <span className="text-base font-bold leading-none">+</span>}
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label={`Custom ${label.toLowerCase()}`} />
      </label>
    </div>
  );
}

function Slider({ label, min, max, value, onChange }: { label: string; min: number; max: number; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-[13px] font-semibold text-plum-soft">
        {label}
        <span className="rounded-full bg-petal px-2 font-mono text-[11px] text-berry">{value}</span>
      </span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full cursor-pointer" />
    </label>
  );
}

function Segmented({ value, onChange, items }: { value: string; onChange: (v: string) => void; items: { id: string; label: ReactNode }[] }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full bg-blush/70 p-1" role="radiogroup">
      {items.map((it) => (
        <button
          key={it.id}
          role="radio"
          aria-checked={value === it.id}
          onClick={() => onChange(it.id)}
          className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-bold transition-colors ${
            value === it.id ? 'bg-paper text-berry shadow-[0_1px_0_#EDB3C4,0_0_0_1.5px_#F2C4D1]' : 'text-plum-soft hover:text-berry'
          }`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex cursor-pointer items-center gap-2 text-[13px] font-bold text-plum">
      <span className={`relative h-[22px] w-[40px] rounded-full transition-colors ${checked ? 'bg-dusty' : 'bg-petal'}`} style={{ boxShadow: 'inset 0 1px 2px rgba(110,67,82,.2)' }}>
        <span className={`absolute top-[3px] h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? 'left-[21px]' : 'left-[3px]'}`} />
      </span>
      {label}
    </button>
  );
}
