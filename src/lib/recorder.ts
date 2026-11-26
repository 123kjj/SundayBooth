// Records a short "pose clip" from the webcam while the countdown runs.
// Frames are mirrored, cropped to 4:3 and run through the same film processor
// as the stills, then encoded in the browser with MediaRecorder. Nothing leaves
// the device.
import { applyBloom, makeFilmProcessor, type FilmId } from './filters';

export interface Clip {
  blob: Blob;
  ext: 'mp4' | 'webm';
  film: FilmId;
  duration: number; // seconds (webm files often don't carry their own duration)
}

const CANDIDATES: [string, Clip['ext']][] = [
  ['video/mp4;codecs=avc1.42E01E', 'mp4'],
  ['video/mp4;codecs=avc1', 'mp4'],
  ['video/mp4', 'mp4'],
  ['video/webm;codecs=vp9', 'webm'],
  ['video/webm;codecs=vp8', 'webm'],
  ['video/webm', 'webm'],
];

function pickFormat() {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return null;
  return CANDIDATES.find(([m]) => MediaRecorder.isTypeSupported(m)) ?? null;
}

export const canRecord = () =>
  typeof HTMLCanvasElement !== 'undefined' && 'captureStream' in HTMLCanvasElement.prototype && pickFormat() !== null;

const W = 640;
const H = 480;
const FPS = 24;

export interface ClipRecorder {
  /** Paint a white flash into the clip (the moment the photo is taken). */
  flash(): void;
  /** Finish and return the clip (null if recording failed). */
  stop(): Promise<Clip | null>;
  /** Abort and throw the recording away. */
  cancel(): void;
}

export function startClip(video: HTMLVideoElement, film: FilmId): ClipRecorder | null {
  const format = pickFormat();
  if (!format || !video.videoWidth) return null;
  const [mime, ext] = format;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const scratch = document.createElement('canvas');
  const process = makeFilmProcessor(W, H, film, Math.floor(Math.random() * 1e6));

  let stream: MediaStream;
  let rec: MediaRecorder;
  try {
    stream = canvas.captureStream(FPS);
    rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 2_500_000 });
  } catch {
    return null;
  }

  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);

  let frame = 0;
  let raf = 0;
  let last = 0;
  let flashAt = 0;
  let running = true;
  const t0 = performance.now();

  const draw = (now: number) => {
    if (!running) return;
    raf = requestAnimationFrame(draw);
    if (now - last < 1000 / FPS - 2) return;
    last = now;
    const vw = video.videoWidth, vh = video.videoHeight;
    if (!vw || !vh) return;
    let sw = vw, sh = vh;
    if (vw / vh > 4 / 3) sw = vh * (4 / 3);
    else sh = vw / (4 / 3);
    ctx.save();
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, W, H);
    ctx.restore();
    const img = ctx.getImageData(0, 0, W, H);
    process(img.data, ++frame);
    ctx.putImageData(img, 0, 0);
    applyBloom(ctx, canvas, film, scratch);
    if (flashAt) {
      const a = 1 - (now - flashAt) / 260;
      if (a > 0) {
        ctx.fillStyle = `rgba(255,255,255,${(a * 0.92).toFixed(3)})`;
        ctx.fillRect(0, 0, W, H);
      }
    }
  };
  draw(performance.now());
  rec.start(250);

  const teardown = () => {
    running = false;
    cancelAnimationFrame(raf);
    stream.getTracks().forEach((t) => t.stop());
  };

  return {
    flash() {
      flashAt = performance.now();
    },
    stop() {
      return new Promise((resolve) => {
        if (rec.state === 'inactive') {
          teardown();
          resolve(null);
          return;
        }
        rec.onstop = () => {
          teardown();
          const blob = new Blob(chunks, { type: mime.split(';')[0] });
          resolve(blob.size ? { blob, ext, film, duration: (performance.now() - t0) / 1000 } : null);
        };
        rec.stop();
      });
    },
    cancel() {
      rec.onstop = null;
      if (rec.state !== 'inactive') rec.stop();
      teardown();
    },
  };
}

export function downloadClip(clip: Clip, name: string) {
  const url = URL.createObjectURL(clip.blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.${clip.ext}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
