import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Me } from '@/api/schema'
import { authKeys } from '@/features/auth/queries'
import { settingsApi } from './api'

/** 급변동 알림 구독. 응답의 내 정보로 캐시를 바로 바꾼다 */
export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: settingsApi.update,
    onSuccess: (me) => queryClient.setQueryData(authKeys.me, me),
  })
}

/** 테스트 DM. 결과로 내 정보의 DM 수신 상태와 마지막 테스트 시각을 바꾼다 */
export function useDmTest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: settingsApi.dmTest,
    onSuccess: (result) =>
      queryClient.setQueryData<Me | null>(
        authKeys.me,
        (me) =>
          me && {
            ...me,
            dmStatus: result.dmStatus,
            guildMember: result.dmStatus !== 'LEFT_GUILD',
            lastDmTestAt: result.testedAt,
          },
      ),
  })
}

/** 탈퇴하면 로그아웃 상태가 되고 사용자별 캐시를 모두 지운다 */
export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: settingsApi.deleteAccount,
    onSuccess: () => {
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== authKeys.me[0],
      })
      queryClient.setQueryData(authKeys.me, null)
    },
  })
}
