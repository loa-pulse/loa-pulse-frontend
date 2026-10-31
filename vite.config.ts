import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

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
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // 날짜 표시는 KST 기준이므로, 실행 환경의 시간대와 상관없이 같은 결과를 내도록 고정한다
    env: { TZ: 'UTC' },
    passWithNoTests: true,
  },
})
