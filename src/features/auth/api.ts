import { ApiError, apiGet, apiRequest } from '@/api/client'
import type { Me } from '@/api/schema'

/** 계정 API (05-api M3) */
export const authApi = {
  /** 로그인하지 않았으면 null. 401은 오류가 아니라 "로그아웃 상태"다 */
  me: async (signal?: AbortSignal): Promise<Me | null> => {
    try {
      return await apiGet<Me>('/api/me', undefined, signal)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null
      throw error
    }
  },

  logout: () => apiRequest<void>('POST', '/api/auth/logout'),
}
