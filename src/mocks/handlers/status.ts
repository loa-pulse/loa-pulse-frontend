import { http, HttpResponse } from 'msw'
import { serviceHealth } from '../data/status'

/** 서비스 상태 목업 (05-api M5). 로그인 없이 쓴다 */
export const statusHandlers = [
  http.get('*/api/status', () => HttpResponse.json(serviceHealth(new Date()))),
]
