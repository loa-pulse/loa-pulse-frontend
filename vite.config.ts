import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    // 개발 중에는 /api 요청을 로컬 백엔드로 넘겨 CORS 설정 없이 호출한다
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
