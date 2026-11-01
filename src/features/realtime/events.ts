import type { AlertDirection, Rankings, ServiceStatus } from '@/api/schema'

/**
 * SSE 이벤트 (loa-pulse-docs design/05-api.md "SSE").
 * OpenAPI로 표현하기 어려워서 05-api.md가 계속 기준이다.
 */

/** 구독한 아이템의 가격이 바뀌었을 때 (D11) */
export type PriceEvent = {
  itemId: number
  currentPrice: number
  previousPrice: number
  changeRate: number | null
  changeRate1h: number | null
  collectedAt: string
}

/** 10초마다. 연결 유지 신호를 겸한다 (D15) */
export type FreshnessEvent = {
  serviceStatus: ServiceStatus
  items: { itemId: number; refreshedAt: string }[]
  sentAt: string
}

/** 랭킹을 구독했고 결과가 바뀌었을 때. GET /api/rankings와 같은 형식 (D12) */
export type RankingEvent = Rankings

/** 로그인 사용자에게 웹 알림이 생겼을 때. 웹 토스트로 보여준다 (기획 4.2) */
export type NotificationEvent = {
  notificationId: number
  alertId: number
  item: { id: number; name: string; iconUrl: string | null }
  price: number
  direction: AlertDirection
  threshold: number
  createdAt: string
}

export type StreamEventMap = {
  price: PriceEvent
  freshness: FreshnessEvent
  ranking: RankingEvent
  notification: NotificationEvent
}

export type StreamEventType = keyof StreamEventMap

export const STREAM_EVENT_TYPES: StreamEventType[] = [
  'price',
  'freshness',
  'ranking',
  'notification',
]
