import { http, HttpResponse } from 'msw'
import type { CategoryCode, ItemSort, ItemSummary, Page } from '@/api/schema'
import {
  categoriesWithCount,
  collectionSummary,
  findSeed,
  itemsInCategory,
  rankings,
  toDailyPrices,
  toDetail,
  toPrices,
  toSummary,
} from '../data/market'

/** VITE_API_BASE_URL이 있어도 맞도록 출처와 상관없이 경로로 찾는다 */
const api = (path: string) => `*/api${path}`

function notFound(detail: string) {
  return HttpResponse.json(
    { type: 'about:blank', title: 'Not Found', status: 404, detail },
    { status: 404, headers: { 'Content-Type': 'application/problem+json' } },
  )
}

const sorters: Record<
  ItemSort,
  ((a: ItemSummary, b: ItemSummary) => number) | null
> = {
  default: null,
  'change-desc': (a, b) =>
    (b.changeRate ?? -Infinity) - (a.changeRate ?? -Infinity),
  'change-asc': (a, b) =>
    (a.changeRate ?? Infinity) - (b.changeRate ?? Infinity),
  'change1h-desc': (a, b) =>
    (b.changeRate1h ?? -Infinity) - (a.changeRate1h ?? -Infinity),
  'change1h-asc': (a, b) =>
    (a.changeRate1h ?? Infinity) - (b.changeRate1h ?? Infinity),
  'price-desc': (a, b) => b.currentPrice - a.currentPrice,
  'price-asc': (a, b) => a.currentPrice - b.currentPrice,
}

export const marketHandlers = [
  http.get(api('/categories'), () => HttpResponse.json(categoriesWithCount())),

  http.get(api('/items'), ({ request }) => {
    const params = new URL(request.url).searchParams
    const category = (params.get('category') ?? 'all') as CategoryCode
    const q = params.get('q')?.trim() ?? ''
    const sort = (params.get('sort') ?? 'default') as ItemSort
    const page = Math.max(1, Number(params.get('page') ?? 1))
    const size = Math.min(50, Math.max(1, Number(params.get('size') ?? 10)))
    const now = new Date()

    let items = itemsInCategory(category)
      .filter((s) => !q || s.name.includes(q))
      .map((s) => toSummary(s, now))
    const sorter = sorters[sort]
    if (sorter) items = [...items].sort(sorter)

    const body: Page<ItemSummary> = {
      content: items.slice((page - 1) * size, page * size),
      page,
      size,
      totalElements: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / size)),
    }
    return HttpResponse.json(body)
  }),

  http.get(api('/items/:itemId'), ({ params }) => {
    const seed = findSeed(Number(params.itemId))
    if (!seed) return notFound('아이템을 찾을 수 없습니다.')
    return HttpResponse.json(toDetail(seed, new Date()))
  }),

  http.get(api('/items/:itemId/prices'), ({ params }) => {
    const seed = findSeed(Number(params.itemId))
    if (!seed) return notFound('아이템을 찾을 수 없습니다.')
    return HttpResponse.json(toPrices(seed, new Date()))
  }),

  http.get(api('/items/:itemId/daily-prices'), ({ params, request }) => {
    const seed = findSeed(Number(params.itemId))
    if (!seed) return notFound('아이템을 찾을 수 없습니다.')
    const days = Math.min(
      14,
      Number(new URL(request.url).searchParams.get('days') ?? 14),
    )
    return HttpResponse.json(toDailyPrices(seed, new Date(), days))
  }),

  http.get(api('/rankings'), () => HttpResponse.json(rankings(new Date()))),

  http.get(api('/collection/summary'), () =>
    HttpResponse.json(collectionSummary(new Date())),
  ),
]
