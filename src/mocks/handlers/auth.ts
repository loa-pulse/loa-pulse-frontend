import { http, HttpResponse } from 'msw'
import { mockAccount, mockMe } from '../data/account'
import { mockAlerts } from '../data/alerts'
import { guard, issueCsrfCookie } from './guards'

/**
 * 계정 목업 (05-api M3). 디스코드 로그인 이동(`/api/auth/login`)은 페이지 이동이라
 * MSW가 받지 못한다. 목업에서는 features/auth/login.ts가 바로 로그인 상태로 바꾼다.
 */
export const authHandlers = [
  http.get('*/api/me', ({ request }) => {
    issueCsrfCookie()
    return guard(request) ?? HttpResponse.json(mockMe(mockAlerts.activeCount()))
  }),

  http.post('*/api/auth/logout', ({ request }) => {
    const denied = guard(request)
    if (denied) return denied
    mockAccount.logOut()
    return new HttpResponse(null, { status: 204 })
  }),
]
