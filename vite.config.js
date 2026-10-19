import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(), react()],
    server: {
      proxy: {
        '/api': {
          target: 'https://minosdb-api.onrender.com',
          changeOrigin: true,
          secure: true,
        },
      },
    },
})
