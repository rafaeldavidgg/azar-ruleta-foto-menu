import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.svg', 'icon-512.svg'],
      manifest: {
        name: 'Azar — Ruleta foto-menú',
        short_name: 'Azar',
        description: 'Ruleta aleatoria efímera: foto de carta en español a opciones, 100% local.',
        lang: 'es',
        start_url: '.',
        display: 'standalone',
        background_color: '#FFF8EC',
        theme_color: '#E4572E',
        icons: [
          { src: 'icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'icon-512.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,wasm,traineddata}'],
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.hostname.includes('tessdata') ||
              url.pathname.includes('traineddata') ||
              url.pathname.endsWith('.wasm'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'ocr-assets',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 90 }
            }
          }
        ]
      }
    })
  ]
})
