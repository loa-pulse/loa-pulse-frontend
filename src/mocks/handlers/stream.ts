import { sse } from 'msw'
import type { RankingEntry } from '@/api/schema'
import type {
  FreshnessEvent,
  NotificationEvent,
  PriceEvent,
  RankingEvent,
  StreamEventType,
} from '@/features/realtime/events'
import { mockAccount } from '../data/account'
import { mockAlerts } from '../data/alerts'
import { findSeed, rankings } from '../data/market'

/** 가격이 바뀌는 간격, freshness 간격(05-api: 10초), 랭킹 계산 간격(D12: 30초) */
const PRICE_INTERVAL_MS = 4_000
const FRESHNESS_INTERVAL_MS = 10_000
const RANKING_INTERVAL_MS = 30_000
/** 접속하고 이만큼 지나면 웹 알림 하나를 보낸다 */
const NOTIFICATION_DELAY_MS = 15_000

let notifiedOnce = false

const round2 = (value: number) => Math.round(value * 100) / 100

/**
 * SSE 목업 (05-api "SSE"). 구독한 아이템 중 하나의 가격을 몇 초마다 조금 바꿔 price 이벤트로,
 * 10초마다 구독한 아이템의 확인 시각을 freshness 이벤트로 보낸다.
 * ranking=true면 30초마다 ranking 이벤트도 보낸다. 연결하면 freshness를 한 번 먼저 보낸다.
 */
export const streamHandlers = [
  sse('*/api/stream', ({ client, request }) => {
    const params = new URL(request.url).searchParams
    const wantsRanking = params.get('ranking') === 'true'
    const ids = (params.get('items') ?? '')
      .split(',')
      .filter(Boolean)
      .map(Number)
    const seeds = ids.map((id) => findSeed(id)).filter((s) => s !== undefined)
    const prices = new Map(seeds.map((s) => [s.id, s.currentPrice]))
    let tick = 0

    const send = (event: StreamEventType, data: unknown) =>
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

    // 실제 서버는 30초마다 다시 계산하고 결과가 바뀌었을 때만 보낸다 (D12).
    // 목업은 변동률을 조금씩 흔들어 화면이 바뀌는 것을 볼 수 있게 한다
    let rankingTick = 0
    const sendRanking = () => {
      const now = new Date()
      const base = rankings(now)
      const shake = (entry: RankingEntry, i: number): RankingEntry => ({
        ...entry,
        changeRate1h: round2(
          entry.changeRate1h * (1 + (((rankingTick + i) % 5) - 2) / 50),
        ),
      })
      rankingTick++
      const body: RankingEvent = {
        rising: base.rising.map(shake),
        falling: base.falling.map(shake),
        calculatedAt: now.toISOString(),
      }
      send('ranking', body)
    }

    sendFreshness()
    const timers = [
      setInterval(sendPrice, PRICE_INTERVAL_MS),
      setInterval(sendFreshness, FRESHNESS_INTERVAL_MS),
    ]
    if (wantsRanking) timers.push(setInterval(sendRanking, RANKING_INTERVAL_MS))

    // 로그인 사용자의 연결에는 웹 알림이 온다. 목업은 페이지마다 한 번만 보낸다
    const notifyTimer = setTimeout(() => {
      if (notifiedOnce || !mockAccount.get().loggedIn) return
      const sent = mockAlerts.triggerOne()
      if (!sent) return
      notifiedOnce = true
      const body: NotificationEvent = {
        notificationId: sent.id,
        alertId: sent.alertId,
        item: {
          id: sent.item.id,
          name: sent.item.name,
          iconUrl: sent.item.iconUrl,
        },
        price: sent.price,
        direction: sent.direction,
        threshold: sent.threshold,
        createdAt: sent.createdAt,
      }
      send('notification', body)
    }, NOTIFICATION_DELAY_MS)

    request.signal.addEventListener('abort', () => {
      timers.forEach((t) => clearInterval(t))
      clearTimeout(notifyTimer)
    })
  }),
]
