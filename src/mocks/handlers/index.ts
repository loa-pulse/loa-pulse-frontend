import type { RequestHandler } from 'msw'
import { authHandlers } from './auth'
import { marketHandlers } from './market'

/**
 * 백엔드 API 목업 핸들러 (design/05-api.md 계약).
 * 개발 서버(VITE_USE_MOCK), Vercel 프리뷰, 테스트가 같은 핸들러를 쓴다.
 * 백엔드가 준비되면 VITE_USE_MOCK을 끄기만 하면 된다.
 */
export const handlers: RequestHandler[] = [...marketHandlers, ...authHandlers]
