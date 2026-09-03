import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Nice To See You — standalone landing page.
 * `base: './'` so the built site can be served from any path.
 */
export default defineConfig({
  base: './',
  plugins: [
    react(),
    // ShaderGradient's dist bundle ships a constants chunk containing the
    // ShaderGradient product's own Stripe checkout URLs. Nothing on this page
    // references them, but this site must contain zero payment surface of any
    // kind, so the literals are neutralised at build time rather than shipped.
    {
      name: 'ntsy-strip-vendor-payment-urls',
      enforce: 'pre',
      transform(code, id) {
        if (!id.includes('@shadergradient')) return null
        if (!code.includes('stripe.com')) return null
        return {
          code: code.replace(/https:\/\/[a-z.]*stripe\.com\/[^"'`]*/g, 'about:blank'),
          map: null,
        }
      },
    },
  ],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
  },
})
