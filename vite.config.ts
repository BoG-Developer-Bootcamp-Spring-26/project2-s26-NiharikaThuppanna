import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Shared proxy: dev + preview both serve `/arrivals` and `/stations` so relative fetch() works.
const apiProxy = {
  '/arrivals': {
    target: 'https://midsem-bootcamp-api.onrender.com',
    changeOrigin: true,
  },
  '/stations': {
    target: 'https://midsem-bootcamp-api.onrender.com',
    changeOrigin: true,
  },
} as const

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { ...apiProxy },
  },
  preview: {
    proxy: { ...apiProxy },
  },
})
