import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'politica-e-privacidade': resolve(__dirname, 'politica-e-privacidade.html'),
        suporte: resolve(__dirname, 'suporte.html'),
      },
    },
  },
})
