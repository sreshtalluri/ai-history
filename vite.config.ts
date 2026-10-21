import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base + hash routing means the build works on GitHub Pages
// (or any static host) without knowing the final URL path.
export default defineConfig({
  base: './',
  plugins: [react()],
});
