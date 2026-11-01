import { apiGet, apiRequest } from '@/api/client'
import type { WatchItem } from '@/api/schema'

/** 관심 아이템 API (05-api M4). 모두 로그인 필요 */
export const watchApi = {
  list: (signal?: AbortSignal) =>
    apiGet<WatchItem[]>('/api/me/watch-items', undefined, signal),

  /** 이미 등록돼 있어도 성공한다 */
  add: (itemId: number) =>
    apiRequest<void>('PUT', `/api/me/watch-items/${itemId}`),

  /** 등록돼 있지 않아도 성공한다 */
  remove: (itemId: number) =>
    apiRequest<void>('DELETE', `/api/me/watch-items/${itemId}`),
}
