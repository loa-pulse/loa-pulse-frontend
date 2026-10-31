import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/client'

const MAX_RETRIES = 2

/**
 * 네트워크 오류와 서버 오류(5xx)만 다시 시도한다.
 * 4xx(없는 아이템, 로그인 필요 등)는 다시 해도 결과가 같으므로 바로 오류를 보여준다.
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false
  if (!(error instanceof ApiError)) return false
  return error.isNetworkError || error.isServerError
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      // 시세는 SSE로 갱신하므로(2단계) 창으로 돌아올 때마다 다시 받지 않는다
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false },
  },
})
