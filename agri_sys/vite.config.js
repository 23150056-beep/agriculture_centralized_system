import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    proxy: {
      '/auth':          { target: 'http://localhost:8001', changeOrigin: true },
      '/products':      { target: 'http://localhost:8001', changeOrigin: true },
      '/distributions': { target: 'http://localhost:8001', changeOrigin: true },
      '/programs':      { target: 'http://localhost:8001', changeOrigin: true },
    },
  },
})
