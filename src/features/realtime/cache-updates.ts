import type { QueryClient } from '@tanstack/react-query'
import type { ItemDetail, ItemPrices, ItemSummary, Page } from '@/api/schema'
import { marketKeys } from '@/features/market/queries'
import type { FreshnessEvent, PriceEvent } from './events'

/** 목록 쿼리(탭·검색·페이지별로 여러 개)의 해당 행을 모두 바꾼다 */
function updateListRows(
  queryClient: QueryClient,
  itemId: number,
  update: (row: ItemSummary) => ItemSummary,
) {
  queryClient.setQueriesData<Page<ItemSummary>>(
    { queryKey: [...marketKeys.all, 'items'] },
    (page) =>
      page && {
        ...page,
        content: page.content.map((row) =>
          row.id === itemId ? update(row) : row,
        ),
      },
  )
}

const newer = (a: string, b: string) => new Date(a) > new Date(b)

/** 같은 분이면 마지막 점을 바꾸고, 다음 분이면 점을 더한다 (오늘 추이는 분 단위) */
function appendPoint(prices: ItemPrices, time: string, price: number) {
  const minute = new Date(time)
  minute.setUTCSeconds(0, 0)
  const point = { time: minute.toISOString(), price }
  const last = prices.points.at(-1)
  const points =
    last && new Date(last.time).getTime() === minute.getTime()
      ? [...prices.points.slice(0, -1), point]
      : [...prices.points, point]
  return { ...prices, points }
}

/** price 이벤트: 상세, 목록, 오늘 추이를 새 가격으로 바꾼다 */
export function applyPriceEvent(queryClient: QueryClient, event: PriceEvent) {
  queryClient.setQueryData<ItemDetail>(marketKeys.item(event.itemId), (item) =>
    item
      ? {
          ...item,
          currentPrice: event.currentPrice,
          changeRate: event.changeRate,
          change:
            item.yesterdayAvgPrice === null
              ? null
              : Math.round((event.currentPrice - item.yesterdayAvgPrice) * 10) /
                10,
          todayLow: Math.min(item.todayLow ?? Infinity, event.currentPrice),
          todayHigh: Math.max(item.todayHigh ?? -Infinity, event.currentPrice),
          priceChangedAt: event.collectedAt,
          refreshedAt: event.collectedAt,
        }
      : item,
  )

  updateListRows(queryClient, event.itemId, (row) => ({
    ...row,
    currentPrice: event.currentPrice,
    changeRate: event.changeRate,
    changeRate1h: event.changeRate1h,
    refreshedAt: event.collectedAt,
  }))

  queryClient.setQueryData<ItemPrices>(
    marketKeys.prices(event.itemId),
    (prices) =>
      prices && appendPoint(prices, event.collectedAt, event.currentPrice),
  )
}

/** freshness 이벤트: 가격이 같아도 확인한 시각(마지막 갱신)을 바꾼다 (D15) */
export function applyFreshnessEvent(
  queryClient: QueryClient,
  event: FreshnessEvent,
) {
  for (const { itemId, refreshedAt } of event.items) {
    queryClient.setQueryData<ItemDetail>(marketKeys.item(itemId), (item) =>
      item && newer(refreshedAt, item.refreshedAt)
        ? { ...item, refreshedAt }
        : item,
    )
    updateListRows(queryClient, itemId, (row) =>
      newer(refreshedAt, row.refreshedAt) ? { ...row, refreshedAt } : row,
    )
  }
}
