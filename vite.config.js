import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.', // Set root to project directory
  build: {
    outDir: 'dist', // Output to dist/ folder
  },
  server: {
    open: true, // Open browser on dev
  },
});