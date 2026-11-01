import { http, HttpResponse } from 'msw'
import type { DmTestResult, SettingsRequest } from '@/api/schema'
import { issueCsrfCookie, mockAccount, mockMe } from '../data/account'
import { mockAlerts } from '../data/alerts'
import { guard } from './guards'

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

  http.patch('*/api/me/settings', async ({ request }) => {
    const denied = guard(request)
    if (denied) return denied
    const body = (await request.json()) as SettingsRequest
    mockAccount.update({ surgeAlertSubscribed: body.surgeAlertSubscribed })
    return HttpResponse.json(mockMe(mockAlerts.activeCount()))
  }),

  /** 목업의 테스트 DM은 언제나 도착한다. 실패 화면은 테스트에서 상태를 바꿔 본다 */
  http.post('*/api/me/dm-test', ({ request }) => {
    const denied = guard(request)
    if (denied) return denied
    const result: DmTestResult = {
      dmStatus: 'OK',
      testedAt: new Date().toISOString(),
    }
    mockAccount.update({
      dmStatus: result.dmStatus,
      lastDmTestAt: result.testedAt,
    })
    return HttpResponse.json(result)
  }),

  /** 탈퇴하면 계정과 알림을 바로 지운다 (D19) */
  http.delete('*/api/me', ({ request }) => {
    const denied = guard(request)
    if (denied) return denied
    mockAccount.reset()
    mockAlerts.reset()
    return new HttpResponse(null, { status: 204 })
  }),
]
