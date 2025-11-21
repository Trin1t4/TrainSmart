import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // UI libraries (animations + icons)
          'vendor-ui': ['framer-motion', 'lucide-react'],

          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],

          // Exercise data (heavy, loaded on-demand)
          'exercise-data': [
            './src/utils/exerciseDescriptions',
            './src/utils/correctiveExerciseDescriptions'
          ],

          // Shared utilities (loaded with exercise data)
          'shared-utils': ['@fitnessflow/shared'],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Increase warning threshold slightly
  },
  server: {
    host: "127.0.0.1",
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
