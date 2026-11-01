import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/client'
import { notifyUnauthorized } from './auth-events'

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

/** 로그인이 필요한 API가 401을 돌려주면 로그인 안내를 띄운다 (05-api "오류") */
export function handleUnauthorized(error: unknown) {
  if (error instanceof ApiError && error.status === 401) notifyUnauthorized()
}

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleUnauthorized }),
    mutationCache: new MutationCache({ onError: handleUnauthorized }),
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        // 시세는 SSE로 갱신하므로(2단계) 창으로 돌아올 때마다 다시 받지 않는다
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  })
}

export const queryClient = createQueryClient()
