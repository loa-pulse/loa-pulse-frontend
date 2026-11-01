import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { AlertRequest } from '@/api/schema'
import { authKeys } from '@/features/auth/queries'
import { alertsApi, type AlertListParams } from './api'

export const alertKeys = {
  all: ['alerts'] as const,
  list: (params: AlertListParams) =>
    [...alertKeys.all, 'list', params] as const,
  notifications: () => [...alertKeys.all, 'notifications'] as const,
}

export const alertsQuery = (params: AlertListParams = {}) =>
  queryOptions({
    queryKey: alertKeys.list(params),
    queryFn: ({ signal }) => alertsApi.list(params, signal),
  })

export const notificationsQuery = () =>
  queryOptions({
    queryKey: alertKeys.notifications(),
    queryFn: ({ signal }) => alertsApi.notifications(signal),
  })

/** 로그인했을 때만 부른다. 로그인 전에는 401이 나와 로그인 안내가 뜨기 때문이다 */
export const useAlerts = (params: AlertListParams = {}, enabled = true) =>
  useQuery({ ...alertsQuery(params), enabled })

export const useNotifications = () => useQuery(notificationsQuery())

/**
 * 알림을 바꾸면 알림 목록(상태별 개수 포함)과 내 정보(활성 알림 수)를 다시 받는다.
 * 목록이 여러 개(전체, 상태별, 아이템별)라서 하나씩 고치기보다 다시 받는 편이 단순하다.
 */
function useAlertMutation<TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: alertKeys.all }),
        queryClient.invalidateQueries({ queryKey: authKeys.me }),
      ]),
  })
}

export const useCreateAlert = () =>
  useAlertMutation((body: AlertRequest) => alertsApi.create(body))

export const useUpdateAlert = () =>
  useAlertMutation(({ id, body }: { id: number; body: AlertRequest }) =>
    alertsApi.update(id, body),
  )

export const usePauseAlert = () => useAlertMutation(alertsApi.pause)
export const useResumeAlert = () => useAlertMutation(alertsApi.resume)
export const useDeleteAlert = () => useAlertMutation(alertsApi.remove)
