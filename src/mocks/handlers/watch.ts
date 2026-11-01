import { http, HttpResponse } from 'msw'
import { findSeed } from '../data/market'
import { mockWatch } from '../data/watch'
import { guard, problem } from './guards'

/** 관심 아이템 목업 (05-api M4). 등록·해제는 여러 번 해도 결과가 같다 */
export const watchHandlers = [
  http.get('*/api/me/watch-items', ({ request }) => {
    return guard(request) ?? HttpResponse.json(mockWatch.list(new Date()))
  }),

  http.put('*/api/me/watch-items/:itemId', ({ request, params }) => {
    const denied = guard(request)
    if (denied) return denied
    const itemId = Number(params.itemId)
    if (!findSeed(itemId)) {
      return problem(404, '아이템을 찾을 수 없습니다.', 'ITEM_NOT_FOUND')
    }
    mockWatch.add(itemId)
    return new HttpResponse(null, { status: 204 })
  }),

  http.delete('*/api/me/watch-items/:itemId', ({ request, params }) => {
    const denied = guard(request)
    if (denied) return denied
    mockWatch.remove(Number(params.itemId))
    return new HttpResponse(null, { status: 204 })
  }),
]
