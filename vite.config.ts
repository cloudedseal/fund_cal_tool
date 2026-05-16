import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/fund': {
        target: 'https://fundcomapi.tiantianfunds.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fund/, ''),
      },
    },
  },
})
