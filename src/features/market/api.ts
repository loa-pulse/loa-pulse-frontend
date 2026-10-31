import { apiGet } from '@/api/client'
import type {
  Category,
  CategoryCode,
  CollectionSummary,
  ItemDailyPrices,
  ItemDetail,
  ItemPrices,
  ItemSort,
  ItemSummary,
  Page,
  Rankings,
} from '@/api/schema'

/** 시세 조회 API (05-api.md M1) */

export type ItemsParams = {
  category: CategoryCode
  q?: string
  sort?: ItemSort
  page: number
  size?: number
}

export const marketApi = {
  categories: (signal?: AbortSignal) =>
    apiGet<Category[]>('/api/categories', undefined, signal),

  items: (params: ItemsParams, signal?: AbortSignal) =>
    apiGet<Page<ItemSummary>>('/api/items', params, signal),

  item: (itemId: number, signal?: AbortSignal) =>
    apiGet<ItemDetail>(`/api/items/${itemId}`, undefined, signal),

  prices: (itemId: number, signal?: AbortSignal) =>
    apiGet<ItemPrices>(`/api/items/${itemId}/prices`, undefined, signal),

  dailyPrices: (itemId: number, days: number, signal?: AbortSignal) =>
    apiGet<ItemDailyPrices>(
      `/api/items/${itemId}/daily-prices`,
      { days },
      signal,
    ),

  rankings: (signal?: AbortSignal) =>
    apiGet<Rankings>('/api/rankings', undefined, signal),

  collectionSummary: (signal?: AbortSignal) =>
    apiGet<CollectionSummary>('/api/collection/summary', undefined, signal),
}
