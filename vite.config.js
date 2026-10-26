import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tailwindcss(), react()],
    server: {
      proxy: {
        '/api': {
          target: 'https://localhost:5000', //change it to the actual render api link if all changes are done
          changeOrigin: true, 
          secure: true,
        },
      },
    },
})
