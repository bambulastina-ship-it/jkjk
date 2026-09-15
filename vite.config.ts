import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        // Keep the heavy WebGL stack out of the initial bundle; it is only
        // ever reached through React.lazy() behind a viewport + motion gate.
        manualChunks(id) {
          if (id.includes('three') || id.includes('@react-three') || id.includes('shadergradient')) {
            return 'shader'
          }
        },
      },
    },
  },
})
