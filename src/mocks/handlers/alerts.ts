import { http, HttpResponse } from 'msw'
import type { AlertRequest, AlertStatus } from '@/api/schema'
import { AlertLimitError, mockAlerts } from '../data/alerts'
import { findSeed } from '../data/market'
import { guard, problem } from './guards'

const limitExceeded = () =>
  problem(
    409,
    '활성 알림은 20개까지 등록할 수 있습니다.',
    'ALERT_LIMIT_EXCEEDED',
  )

/** 백엔드의 요청 검증과 같은 400 (05-api "오류": errors에 필드별 사유) */
function validate(body: AlertRequest) {
  const errors: Record<string, string> = {}
  if (!Number.isInteger(body.threshold) || body.threshold < 1) {
    errors.threshold = '기준가는 1 이상의 정수여야 합니다.'
  }
  if (!body.channels?.dm && !body.channels?.web) {
    errors.channels = '받을 곳을 하나 이상 골라야 합니다.'
  }
  if (Object.keys(errors).length === 0) return null
  return HttpResponse.json(
    {
      type: 'about:blank',
      title: 'Bad Request',
      status: 400,
      detail: '요청 값이 올바르지 않습니다.',
      errors,
    },
    { status: 400 },
  )
}

/** 알림이 없거나 다른 사용자의 것이면 404 */
function findOr404(id: string | readonly string[] | undefined) {
  const alert = mockAlerts.find(Number(id))
  return alert
    ? null
    : problem(404, '알림을 찾을 수 없습니다.', 'ALERT_NOT_FOUND')
}

function changeStatus(id: number, status: AlertStatus) {
  try {
    return HttpResponse.json(mockAlerts.setStatus(id, status))
  } catch (error) {
    if (error instanceof AlertLimitError) return limitExceeded()
    throw error
  }
}

/** 목표가 알림 목업 (05-api M3). 모두 로그인과 CSRF를 검사한다 */
export const alertHandlers = [
  http.get('*/api/alerts', ({ request }) => {
    const denied = guard(request)
    if (denied) return denied
    const params = new URL(request.url).searchParams
    return HttpResponse.json(
      mockAlerts.list({
        status: (params.get('status') as AlertStatus | null) ?? undefined,
        itemId: params.has('itemId') ? Number(params.get('itemId')) : undefined,
      }),
    )
  }),

  http.post('*/api/alerts', async ({ request }) => {
    const denied = guard(request)
    if (denied) return denied
    const body = (await request.json()) as AlertRequest
    if (!findSeed(body.itemId)) {
      return problem(404, '아이템을 찾을 수 없습니다.', 'ITEM_NOT_FOUND')
    }
    const invalid = validate(body)
    if (invalid) return invalid
    try {
      return HttpResponse.json(mockAlerts.create(body), { status: 201 })
    } catch (error) {
      if (error instanceof AlertLimitError) return limitExceeded()
      throw error
    }
  }),

  http.patch('*/api/alerts/:alertId', async ({ request, params }) => {
    const denied = guard(request) ?? findOr404(params.alertId)
    if (denied) return denied
    const body = (await request.json()) as AlertRequest
    const invalid = validate(body)
    if (invalid) return invalid
    return HttpResponse.json(mockAlerts.update(Number(params.alertId), body))
  }),

  http.post('*/api/alerts/:alertId/pause', ({ request, params }) => {
    const denied = guard(request) ?? findOr404(params.alertId)
    if (denied) return denied
    return changeStatus(Number(params.alertId), 'PAUSED')
  }),

  http.post('*/api/alerts/:alertId/resume', ({ request, params }) => {
    const denied = guard(request) ?? findOr404(params.alertId)
    if (denied) return denied
    return changeStatus(Number(params.alertId), 'ACTIVE')
  }),

  http.delete('*/api/alerts/:alertId', ({ request, params }) => {
    const denied = guard(request) ?? findOr404(params.alertId)
    if (denied) return denied
    mockAlerts.remove(Number(params.alertId))
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('*/api/notifications', ({ request }) => {
    return guard(request) ?? HttpResponse.json(mockAlerts.notifications())
  }),
]
