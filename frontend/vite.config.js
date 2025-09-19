import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Esta es la configuración más simple y correcta.
// No necesita ninguna referencia a css o postcss.
// Vite buscará automáticamente el archivo postcss.config.js.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5371,
    open: true,
  },
})
