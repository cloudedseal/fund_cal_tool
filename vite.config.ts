import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** 东方财富定投计算器后端（天天基金） */
const EASTMONEY_DT_API_TARGET = 'https://fundcomapi.tiantianfunds.com'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/eastmoney': {
        target: EASTMONEY_DT_API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/eastmoney/, ''),
        headers: {
          Origin: 'https://data.eastmoney.com',
          Referer: 'https://data.eastmoney.com/',
        },
      },
    },
  },
  preview: {
    proxy: {
      '/api/eastmoney': {
        target: EASTMONEY_DT_API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/eastmoney/, ''),
        headers: {
          Origin: 'https://data.eastmoney.com',
          Referer: 'https://data.eastmoney.com/',
        },
      },
    },
  },
})
