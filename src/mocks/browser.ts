import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
import { streamHandlers } from './handlers/stream'

/**
 * 브라우저(개발 서버, Vercel 프리뷰)용 목업. VITE_USE_MOCK=true일 때만 켠다.
 * SSE 목업은 EventSource가 있는 브라우저에서만 만들 수 있어서 여기서만 더한다.
 */
export const worker = setupWorker(...handlers, ...streamHandlers)
