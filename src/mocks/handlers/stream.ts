import { sse } from 'msw'
import type { FreshnessEvent, PriceEvent } from '@/features/realtime/events'
import { findSeed } from '../data/market'

/** 가격이 바뀌는 간격과 freshness 간격 (05-api: freshness는 10초마다) */
const PRICE_INTERVAL_MS = 4_000
const FRESHNESS_INTERVAL_MS = 10_000

const round2 = (value: number) => Math.round(value * 100) / 100

/**
 * SSE 목업 (05-api "SSE"). 구독한 아이템 중 하나의 가격을 몇 초마다 조금 바꿔 price 이벤트로,
 * 10초마다 구독한 아이템의 확인 시각을 freshness 이벤트로 보낸다.
 * 연결하면 freshness를 한 번 먼저 보낸다.
 */
export const streamHandlers = [
  sse('*/api/stream', ({ client, request }) => {
    const ids = (new URL(request.url).searchParams.get('items') ?? '')
      .split(',')
      .filter(Boolean)
      .map(Number)
    const seeds = ids.map((id) => findSeed(id)).filter((s) => s !== undefined)
    const prices = new Map(seeds.map((s) => [s.id, s.currentPrice]))
    let tick = 0

    const send = (event: 'price' | 'freshness', data: unknown) =>
      client.send({ event, data: JSON.stringify(data) } as never)

    const sendFreshness = () => {
      const now = new Date().toISOString()
      const body: FreshnessEvent = {
        serviceStatus: 'NORMAL',
        items: ids.map((itemId) => ({ itemId, refreshedAt: now })),
        sentAt: now,
      }
      send('freshness', body)
    }

    const sendPrice = () => {
      if (seeds.length === 0) return
      const seed = seeds[tick++ % seeds.length]
      const previous = prices.get(seed.id)!
      const step = Math.max(1, Math.round(previous * 0.01))
      const current = Math.max(1, previous + (tick % 3 === 0 ? -step : step))
      prices.set(seed.id, current)
      const body: PriceEvent = {
        itemId: seed.id,
        currentPrice: current,
        previousPrice: previous,
        changeRate: seed.yesterdayAvgPrice
          ? round2(
              ((current - seed.yesterdayAvgPrice) / seed.yesterdayAvgPrice) *
                100,
            )
          : null,
        changeRate1h: round2(
          ((current - seed.currentPrice) / seed.currentPrice) * 100,
        ),
        collectedAt: new Date().toISOString(),
      }
      send('price', body)
    }

    sendFreshness()
    const timers = [
      setInterval(sendPrice, PRICE_INTERVAL_MS),
      setInterval(sendFreshness, FRESHNESS_INTERVAL_MS),
    ]
    request.signal.addEventListener('abort', () =>
      timers.forEach((t) => clearInterval(t)),
    )
  }),
]
