import { apiGet, apiRequest } from '@/api/client'
import type {
  Alert,
  AlertList,
  AlertRequest,
  AlertStatus,
  Notification,
} from '@/api/schema'

/** 목표가 알림 API (05-api M3). 모두 로그인 필요 */

export type AlertListParams = {
  status?: AlertStatus
  itemId?: number
}

export const alertsApi = {
  list: (params: AlertListParams = {}, signal?: AbortSignal) =>
    apiGet<AlertList>('/api/alerts', params, signal),

  create: (body: AlertRequest) =>
    apiRequest<Alert>('POST', '/api/alerts', { body }),

  update: (alertId: number, body: AlertRequest) =>
    apiRequest<Alert>('PATCH', `/api/alerts/${alertId}`, { body }),

  pause: (alertId: number) =>
    apiRequest<Alert>('POST', `/api/alerts/${alertId}/pause`),

  resume: (alertId: number) =>
    apiRequest<Alert>('POST', `/api/alerts/${alertId}/resume`),

  remove: (alertId: number) =>
    apiRequest<void>('DELETE', `/api/alerts/${alertId}`),

  notifications: (signal?: AbortSignal) =>
    apiGet<Notification[]>('/api/notifications', undefined, signal),
}
