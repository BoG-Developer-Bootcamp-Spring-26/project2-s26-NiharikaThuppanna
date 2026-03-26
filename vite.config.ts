import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { ...apiProxy },
  },
  preview: {
    proxy: { ...apiProxy },
  },
})
