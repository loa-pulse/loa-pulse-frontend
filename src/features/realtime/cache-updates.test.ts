import { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it } from 'vitest'
import type { ItemDetail, ItemPrices, ItemSummary, Page } from '@/api/schema'
import { marketKeys } from '@/features/market/queries'
import { applyFreshnessEvent, applyPriceEvent } from './cache-updates'

const ID = 66102007
const listKey = marketKeys.items({ category: 'refining', page: 1 })

const row: ItemSummary = {
  id: ID,
  name: '운명의 파괴석 결정',
  grade: '일반',
  categoryName: '재련 재료',
  iconUrl: null,
  bundleCount: 100,
  currentPrice: 829,
  changeRate: -7.32,
  changeRate1h: null,
  refreshedAt: '2026-11-01T05:30:00Z',
  watched: false,
}

const detail: ItemDetail = {
  ...row,
  categoryCode: 'refining',
  yesterdayAvgPrice: 894.5,
  change: -65.5,
  todayLow: 820,
  todayHigh: 846,
  yesterdayTradeCount: 1,
  priceChangedAt: '2026-11-01T05:20:00Z',
}

let queryClient: QueryClient

beforeEach(() => {
  queryClient = new QueryClient()
  queryClient.setQueryData(marketKeys.item(ID), detail)
  queryClient.setQueryData<Page<ItemSummary>>(listKey, {
    content: [row, { ...row, id: 1 }],
    page: 1,
    size: 10,
    totalElements: 2,
    totalPages: 1,
  })
  queryClient.setQueryData<ItemPrices>(marketKeys.prices(ID), {
    itemId: ID,
    yesterdayAvgPrice: 894.5,
    points: [{ time: '2026-11-01T05:30:00.000Z', price: 829 }],
  })
})

describe('applyPriceEvent', () => {
  const event = {
    itemId: ID,
    currentPrice: 815,
    previousPrice: 829,
    changeRate: -8.89,
    changeRate1h: -1.5,
    collectedAt: '2026-11-01T05:31:20Z',
  }

  it('상세의 현재가, 전일 대비, 오늘 최저를 바꾼다', () => {
    applyPriceEvent(queryClient, event)
    expect(queryClient.getQueryData(marketKeys.item(ID))).toMatchObject({
      currentPrice: 815,
      change: -79.5,
      changeRate: -8.89,
      todayLow: 815,
      todayHigh: 846,
      refreshedAt: event.collectedAt,
    })
  })

  it('목록에서는 해당 행만 바꾼다', () => {
    applyPriceEvent(queryClient, event)
    const page = queryClient.getQueryData<Page<ItemSummary>>(listKey)!
    expect(page.content[0]).toMatchObject({
      currentPrice: 815,
      changeRate1h: -1.5,
    })
    expect(page.content[1].currentPrice).toBe(829)
  })

  it('오늘 추이에 다음 분의 점을 더하고, 같은 분이면 바꾼다', () => {
    applyPriceEvent(queryClient, event)
    applyPriceEvent(queryClient, {
      ...event,
      currentPrice: 812,
      collectedAt: '2026-11-01T05:31:50Z',
    })
    const prices = queryClient.getQueryData<ItemPrices>(marketKeys.prices(ID))!
    expect(prices.points).toEqual([
      { time: '2026-11-01T05:30:00.000Z', price: 829 },
      { time: '2026-11-01T05:31:00.000Z', price: 812 },
    ])
  })
})

describe('applyFreshnessEvent', () => {
  it('더 최근에 확인한 시각만 반영한다', () => {
    applyFreshnessEvent(queryClient, {
      serviceStatus: 'NORMAL',
      items: [{ itemId: ID, refreshedAt: '2026-11-01T05:31:00Z' }],
      sentAt: '2026-11-01T05:31:00Z',
    })
    expect(
      queryClient.getQueryData<ItemDetail>(marketKeys.item(ID))!.refreshedAt,
    ).toBe('2026-11-01T05:31:00Z')

    applyFreshnessEvent(queryClient, {
      serviceStatus: 'NORMAL',
      items: [{ itemId: ID, refreshedAt: '2026-11-01T05:00:00Z' }],
      sentAt: '2026-11-01T05:31:10Z',
    })
    expect(
      queryClient.getQueryData<Page<ItemSummary>>(listKey)!.content[0]
        .refreshedAt,
    ).toBe('2026-11-01T05:31:00Z')
  })
})
