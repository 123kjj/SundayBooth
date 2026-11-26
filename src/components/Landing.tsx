import { Bow, Camera, CD, Cherry, DoodleArrow, DoodleHeart, Heart, HeartIcon, Logo, RetroTV, Sparkle, Squiggle, Star, Win } from './Art';

const STEPS = ['pick a film', 'strike 4 poses', 'decorate', 'print & keep'];

export default function Landing({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative mx-auto w-full max-w-[1040px] pt-2">
      {/* stickers hanging off the window */}
      <Bow className="absolute -left-4 -top-6 z-10 -rotate-12 sm:-left-8" size={70} />
      <Heart className="absolute -right-2 -top-4 z-10 rotate-12 animate-float" size={40} tone="lav" />
      <Star className="absolute right-16 -top-5 z-10" size={30} />

      <Win title="sunday booth" barClassName="pl-16" bodyClassName="relative grid items-center gap-8 overflow-hidden p-6 sm:p-10 md:grid-cols-[1.05fr_1fr] md:gap-4">
        <div className="relative z-10 order-2 text-center md:order-1 md:text-left">
          <span className="chip mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-dusty" /> an online photo booth
          </span>
          <h1 className="relative">
            <span className="sr-only">Sunday Booth</span>
            <span aria-hidden>
              <Logo />
            </span>
          </h1>
          <p className="h-hand mt-5 text-[22px] sm:text-[24px]">snap, pose, and keep your <span className="whitespace-nowrap">memories ♡</span></p>
          <p className="mx-auto mt-3 max-w-[400px] text-[15.5px] leading-relaxed text-plum md:mx-0">
            A tiny photo studio that lives in your browser. Four flashes, a film look you love, cute stickers, and a printed strip at the end.
          </p>

          <div className="mt-7 flex flex-col items-center gap-3 md:flex-row md:items-center">
            <button className="btn btn-pink btn-lg" onClick={onStart}>
              start booth <HeartIcon size={16} />
            </button>
            <span className="relative flex items-center gap-1 pl-1">
              <DoodleArrow className="-scale-x-100 rotate-[200deg] max-md:hidden" />
              <span className="note text-[20px]">takes about a minute!</span>
            </span>
          </div>

          <ol className="mx-auto mt-8 flex max-w-[440px] flex-wrap justify-center gap-2 md:mx-0 md:justify-start">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-1.5 rounded-full bg-paper py-1 pl-1 pr-3 text-[13px] font-semibold" style={{ border: '1.5px dashed #EDB3C4' }}>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-petal font-hand text-[13px] font-bold text-berry">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <p className="note mt-5 text-[16px]">a little online photo studio ♡</p>
        </div>

        {/* illustration cluster */}
        <div className="relative order-1 mx-auto aspect-[1/0.92] w-full max-w-[300px] sm:max-w-[400px] md:order-2 md:max-w-none">
          <div className="gingham absolute inset-[8%_6%_10%_10%] rotate-3 rounded-[28px]" style={{ border: '2px solid #F3C9D5', boxShadow: '0 0 0 5px #FFFCF9' }} />
          <span className="tape left-[30%] top-[4%] -rotate-6" />
          <span className="tape tape-blue bottom-[6%] right-[8%] rotate-[24deg]" />

          {/* taped mini strip */}
          <div className="absolute right-[10%] top-[12%] w-[18%] rotate-[8deg] rounded-[6px] bg-paper p-[3%] shadow-[0_8px_16px_-10px_rgba(194,90,125,0.7)]">
            {['#F7BCCB', '#C9DEF1', '#FBE39A', '#DCD0F5'].map((c) => (
              <span key={c} className="mb-[8%] block aspect-[4/3] rounded-[3px]" style={{ background: c }} />
            ))}
            <Squiggle width={30} className="mx-auto block" />
          </div>

          <Camera className="absolute left-[14%] top-[22%] w-[58%] -rotate-6 drop-shadow-[0_10px_12px_rgba(194,90,125,0.25)]" />
          <Bow className="absolute left-[16%] top-[13%] -rotate-12" size={64} />
          <RetroTV className="absolute bottom-[8%] right-[4%] w-[34%] rotate-[8deg]" />
          <CD className="absolute bottom-[2%] left-[4%] w-[24%] animate-[spin_14s_linear_infinite]" />
          <Cherry className="absolute left-[2%] top-[34%] -rotate-12" size={52} />
          <Heart className="absolute bottom-[13%] left-[36%] -rotate-12" size={28} tone="rose" />
          <Star className="absolute right-[34%] top-[5%]" size={26} tone="blue" />
          <Sparkle className="absolute bottom-[24%] right-[42%]" size={20} />
          <Sparkle className="absolute left-[8%] top-[10%]" size={16} tone="butter" />
          <DoodleHeart className="absolute bottom-[2%] right-[44%] rotate-12" />
        </div>
      </Win>
    </section>
  );
}
