import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'gl-gradient': ['@shadergradient/react'],
          'gl-metal': ['@paper-design/shaders-react'],
          three: ['three', '@react-three/fiber'],
        },
      },
    },
  },
})
