import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Avoid browser CORS blocks by proxying API requests through Vite dev server.
      '/arrivals': {
        target: 'https://midsem-bootcamp-api.onrender.com',
        changeOrigin: true,
      },
      '/stations': {
        target: 'https://midsem-bootcamp-api.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
