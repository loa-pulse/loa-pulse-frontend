import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/** 브라우저(개발 서버, Vercel 프리뷰)용 목업. VITE_USE_MOCK=true일 때만 켠다 */
export const worker = setupWorker(...handlers)
