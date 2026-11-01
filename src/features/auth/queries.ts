import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { authApi } from './api'

export const authKeys = {
  me: ['auth', 'me'] as const,
}

export const meQuery = () =>
  queryOptions({
    queryKey: authKeys.me,
    queryFn: ({ signal }) => authApi.me(signal),
    staleTime: 5 * 60_000,
  })

/** 내 정보. 로그인하지 않았으면 data가 null */
export const useMe = () => useQuery(meQuery())

/** 로그인 여부. 확인하는 동안은 isPending */
export function useAuth() {
  const { data, isPending } = useMe()
  return { me: data ?? null, isLoggedIn: !!data, isPending }
}

/** 로그아웃하면 사용자별 값(관심 여부, 알림)이 든 캐시를 모두 다시 받는다 */
export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me, null)
      return queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== authKeys.me[0],
      })
    },
  })
}
