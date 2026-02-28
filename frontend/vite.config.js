import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    legacy({
      // Target browsers going back ~4 years + specific legacy ones
      targets: [
        'defaults',
        'not IE 11',          // IE11 is truly dead; we handle it separately
        'chrome >= 60',
        'firefox >= 60',
        'safari >= 12',
        'edge >= 18',
        'ios >= 12',
        'android >= 6',
      ],
      // Automatically add polyfills for missing browser features
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      // Polyfill modern APIs (Promise, fetch, etc.) for old browsers
      modernPolyfills: true,
      renderLegacyChunks: true,
    }),
  ],
  build: {
    // Use terser for better minification & compatibility
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        ecma: 5,
      },
    },
    // Ensure assets are inlined if small enough
    assetsInlineLimit: 4096,
    // Generate sourcemaps for debugging
    sourcemap: false,
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/auth': 'http://127.0.0.1:8000',
      '/users': 'http://127.0.0.1:8000',
    }
  },
})
