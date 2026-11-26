// Tiny synthesized sound effects (no audio files to download).
let ctx: AudioContext | null = null;
let enabled = true;

try {
  const saved = localStorage.getItem('sunday-booth:sound');
  if (saved !== null) enabled = saved === '1';
} catch { /* storage may be unavailable */ }

export const isSoundOn = () => enabled;
export function setSoundOn(v: boolean) {
  enabled = v;
  try { localStorage.setItem('sunday-booth:sound', v ? '1' : '0'); } catch { /* ignore */ }
}

function ac() {
  if (!enabled) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function noiseBuffer(a: AudioContext, seconds: number) {
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * seconds), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/** Soft countdown tick. Higher pitch on the last beat. */
export function playTick(last = false) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = 'sine';
  o.frequency.value = last ? 1180 : 880;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + 0.2);
}

/** Mechanical shutter: two short filtered clicks. */
export function playShutter() {
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  const buf = noiseBuffer(a, 0.25);
  [0, 0.075].forEach((offset, i) => {
    const src = a.createBufferSource();
    src.buffer = buf;
    const f = a.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = i === 0 ? 2600 : 1700;
    f.Q.value = 0.9;
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t + offset);
    g.gain.exponentialRampToValueAtTime(0.5, t + offset + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.06);
    src.connect(f).connect(g).connect(a.destination);
    src.start(t + offset);
    src.stop(t + offset + 0.1);
  });
}

/** Gentle printer whirr with little stepper pulses. Returns a stop function. */
export function playPrinter(duration = 3): () => void {
  const a = ac();
  if (!a) return () => undefined;
  const t = a.currentTime;
  const src = a.createBufferSource();
  src.buffer = noiseBuffer(a, duration + 0.2);
  const f = a.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = 900;
  f.Q.value = 1.4;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.07, t + 0.15);
  // stepper motor flutter
  const lfo = a.createOscillator();
  const lfoGain = a.createGain();
  lfo.frequency.value = 22;
  lfoGain.gain.value = 0.035;
  lfo.connect(lfoGain).connect(g.gain);
  g.gain.setValueAtTime(0.07, t + duration - 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  const hum = a.createOscillator();
  const humGain = a.createGain();
  hum.type = 'triangle';
  hum.frequency.value = 140;
  humGain.gain.setValueAtTime(0.0001, t);
  humGain.gain.exponentialRampToValueAtTime(0.025, t + 0.2);
  humGain.gain.setValueAtTime(0.025, t + duration - 0.25);
  humGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  src.connect(f).connect(g).connect(a.destination);
  hum.connect(humGain).connect(a.destination);
  src.start(t); lfo.start(t); hum.start(t);
  src.stop(t + duration); lfo.stop(t + duration); hum.stop(t + duration);
  return () => {
    try { src.stop(); lfo.stop(); hum.stop(); } catch { /* already stopped */ }
  };
}

/** A cheerful two-note "ding" when the strip is ready. */
export function playDing() {
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  [[1318.5, 0], [1760, 0.11]].forEach(([freq, off]) => {
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t + off);
    g.gain.exponentialRampToValueAtTime(0.1, t + off + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + off + 0.6);
    o.connect(g).connect(a.destination);
    o.start(t + off);
    o.stop(t + off + 0.65);
  });
}
