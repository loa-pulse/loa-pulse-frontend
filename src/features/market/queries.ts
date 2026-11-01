import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { marketApi, type ItemsParams } from './api'

/**
 * 시세 조회 쿼리. 키는 SSE로 캐시를 갱신할 때(2단계)도 같은 것을 쓴다.
 * 시세 값 자체는 실시간 이벤트로 바뀌므로 화면이 다시 보일 때마다 새로 받지는 않는다.
 */
export const marketKeys = {
  all: ['market'] as const,
  categories: () => [...marketKeys.all, 'categories'] as const,
  items: (params: ItemsParams) => [...marketKeys.all, 'items', params] as const,
  item: (itemId: number) => [...marketKeys.all, 'item', itemId] as const,
  prices: (itemId: number) => [...marketKeys.item(itemId), 'prices'] as const,
  dailyPrices: (itemId: number, days: number) =>
    [...marketKeys.item(itemId), 'daily', days] as const,
  rankings: () => [...marketKeys.all, 'rankings'] as const,
  collectionSummary: () => [...marketKeys.all, 'collection-summary'] as const,
}

/** 첫 화면용. 이후에는 SSE ranking 이벤트가 캐시를 바꾼다 */
export const rankingsQuery = () =>
  queryOptions({
    queryKey: marketKeys.rankings(),
    queryFn: ({ signal }) => marketApi.rankings(signal),
  })

export const categoriesQuery = () =>
  queryOptions({
    queryKey: marketKeys.categories(),
    queryFn: ({ signal }) => marketApi.categories(signal),
    staleTime: 5 * 60_000,
  })

export const itemsQuery = (params: ItemsParams) =>
  queryOptions({
    queryKey: marketKeys.items(params),
    queryFn: ({ signal }) => marketApi.items(params, signal),
    // 탭이나 페이지를 바꾸는 동안 이전 목록을 유지해 표가 깜빡이지 않게 한다
    placeholderData: keepPreviousData,
  })

export const itemQuery = (itemId: number) =>
  queryOptions({
    queryKey: marketKeys.item(itemId),
    queryFn: ({ signal }) => marketApi.item(itemId, signal),
  })

export const pricesQuery = (itemId: number) =>
  queryOptions({
    queryKey: marketKeys.prices(itemId),
    queryFn: ({ signal }) => marketApi.prices(itemId, signal),
  })

export const dailyPricesQuery = (itemId: number, days = 14) =>
  queryOptions({
    queryKey: marketKeys.dailyPrices(itemId, days),
    queryFn: ({ signal }) => marketApi.dailyPrices(itemId, days, signal),
    // 일별 통계는 하루에 한 번 바뀐다
    staleTime: 30 * 60_000,
  })

export const collectionSummaryQuery = () =>
  queryOptions({
    queryKey: marketKeys.collectionSummary(),
    queryFn: ({ signal }) => marketApi.collectionSummary(signal),
    refetchInterval: 60_000,
  })

export const useCategories = () => useQuery(categoriesQuery())
export const useItems = (params: ItemsParams) => useQuery(itemsQuery(params))
export const useItem = (itemId: number) => useQuery(itemQuery(itemId))
export const usePrices = (itemId: number) => useQuery(pricesQuery(itemId))
export const useDailyPrices = (itemId: number, days?: number) =>
  useQuery(dailyPricesQuery(itemId, days))
export const useRankings = () => useQuery(rankingsQuery())
export const useCollectionSummary = () => useQuery(collectionSummaryQuery())
