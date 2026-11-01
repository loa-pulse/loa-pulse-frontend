import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/api/client'
import type { ServiceHealth } from '@/api/schema'

/** 서비스 상태 API (05-api M5, D30). 로그인 없이 쓴다 */
export const statusApi = {
  get: (signal?: AbortSignal) =>
    apiGet<ServiceHealth>('/api/status', undefined, signal),
}

/** 상태 화면은 1분마다 다시 받는다 (Figma "1분마다 갱신") */
export const STATUS_REFRESH_MS = 60_000

export const useServiceHealth = () =>
  useQuery({
    queryKey: ['status'],
    queryFn: ({ signal }) => statusApi.get(signal),
    refetchInterval: STATUS_REFRESH_MS,
  })
