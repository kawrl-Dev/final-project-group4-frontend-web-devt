import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tailwindcss(), react()],
    server: {
      proxy: {
        '/api': {
          target: 'https://minosdb-api.onrender.com/',
          changeOrigin: true, 
          secure: true,
        },
      },
    },
})
