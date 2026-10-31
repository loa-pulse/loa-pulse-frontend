import type { ServiceStatus } from '@/api/schema'

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

export type StreamEventMap = {
  price: PriceEvent
  freshness: FreshnessEvent
}

export type StreamEventType = keyof StreamEventMap

export const STREAM_EVENT_TYPES: StreamEventType[] = ['price', 'freshness']
