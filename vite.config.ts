import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` -> regular multi-file build in dist/
// `npm run build:single` -> one self-contained index.html in dist-single/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  base: './',
  build: mode === 'single' ? { outDir: 'dist-single', assetsInlineLimit: 100_000_000 } : {},
}));
