import { defineConfig, mergeConfig } from 'vite'
import base from './vite.config.js'

// Temporary config: emit ONE self-contained bundle for artifact preview.
export default mergeConfig(base, defineConfig({
  base: './',
  build: {
    outDir: 'dist-single',
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 100_000,
    rollupOptions: { output: { inlineDynamicImports: true, manualChunks: undefined } },
  },
}))
