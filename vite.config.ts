/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Firebase into its own chunk
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // Split React ecosystem into vendor chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Split TanStack Query
          'tanstack-query': ['@tanstack/react-query'],
          // Split UI icons
          'lucide-icons': ['lucide-react'],
        },
      },
    },
    // Increase chunk size warning limit slightly since we're optimizing
    chunkSizeWarningLimit: 300,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
})
