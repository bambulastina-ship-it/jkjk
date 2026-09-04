import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Temporary standalone config: ONE self-contained bundle for artifact preview.
// Does not extend vite.config.js, whose manualChunks conflicts with
// inlineDynamicImports.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    outDir: 'dist-single',
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 100_000,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
})
