# Sunday Booth

A tiny online photo booth in a pastel, 2000s scrapbook style: pick a film, take four photos with your webcam, decorate the strip, watch it print, and download a high-resolution PNG plus a 3-second video of each pose. Everything happens in the browser. Nothing is uploaded or stored.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

Browsers only allow camera access on `https://` or `localhost`, so use the dev server or deploy it.

## Build

```bash
npm run build          # static site in dist/ (deploy to Netlify, Vercel, GitHub Pages…)
npm run build:single   # one self-contained file: dist-single/index.html
```

The single-file build also works when opened straight from disk (file://) in Chrome, Edge, Firefox and Safari.

## How it's put together

| File | What it does |
| --- | --- |
| `src/App.tsx` | Screen flow (landing → film → pose → decorate → print), shared state, sound toggle |
| `src/components/Landing.tsx` | Welcome screen with the illustrated booth |
| `src/components/BoothSelect.tsx` | Four film cards. Each preview strip is drawn and run through the real film filter |
| `src/components/CameraBooth.tsx` | Live viewfinder, countdown, auto-capture, flash, retake one photo or restart |
| `src/components/Customize.tsx` | Themes, colours, frame, spacing, corners, stickers, caption, date stamp |
| `src/components/PrintReveal.tsx` | Printer animation, then the results: strip + pose-video player, PNG and video downloads |
| `src/lib/useCamera.ts` | getUserMedia, choosing a camera, error states. Stops the stream when you leave the camera screen or switch tabs |
| `src/lib/filters.ts` | The four film looks, done pixel by pixel (contrast, split toning, faded blacks, vignette, seeded grain, bloom) |
| `src/lib/strip.ts` | Strip layout and renderer. The preview and the PNG come from the same function at different scales, so they match |
| `src/lib/stickers.ts` | Vector stickers drawn on canvas (crisp at any size) |
| `src/lib/recorder.ts` | Records each pose's 3-second countdown as a video (MP4 where supported, otherwise WebM), with the same film look as the photos |
| `src/components/Art.tsx` | All the illustrations and stickers (bows, cherries, CD, TV, camera, printer, windows, wordmark), as inline SVG |
| `src/lib/sound.ts` | Countdown tick, shutter, printer and ding, synthesised with Web Audio (no audio files) |

Shortcut: press **space** on the camera screen to start a session.
