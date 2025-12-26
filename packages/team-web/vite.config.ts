import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared/src'),
      '@trainsmart/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  server: {
    port: 5174, // Different port from main app (5173)
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
