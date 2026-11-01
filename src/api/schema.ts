/**
 * 백엔드 API 응답 타입.
 *
 * 지금은 loa-pulse-docs `design/05-api.md`의 계약을 보고 직접 쓴 타입이다.
 * 백엔드 OpenAPI(`openapi.json`)가 나오면 openapi-typescript 생성 타입으로 바꾼다
 * (08-frontend-plan 1-13). 화면 코드는 이 파일의 타입만 참조한다.
 *
 * 규칙 (05-api.md "형식"): 시각은 UTC ISO-8601, 날짜는 KST `yyyy-MM-dd`,
 * 가격은 `bundleCount`개 묶음 기준 골드, 값이 없으면 null.
 */

/** 목록 응답. 페이지는 1부터 */
export type Page<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/** 시세 목록 탭 */
export type CategoryCode =
  | 'all'
  | 'refining'
  | 'refining-extra'
  | 'engraving'
  | 'battle'
  | 'life'
  | 'cooking'
  | 'etc'

export type Category = {
  code: CategoryCode
  name: string
  itemCount: number
}

export type ItemSort =
  | 'default'
  | 'change-desc'
  | 'change-asc'
  | 'change1h-desc'
  | 'change1h-asc'
  | 'price-desc'
  | 'price-asc'

/** GET /api/items 의 한 행 */
export type ItemSummary = {
  id: number
  name: string
  /** 한글 등급 이름 (예: "유물") */
  grade: string
  categoryName: string
  iconUrl: string | null
  bundleCount: number
  /** 현재 최저가 */
  currentPrice: number
  /** 전일 대비 변동률(%). 전일 평균가가 없으면 null */
  changeRate: number | null
  /** 최근 1시간 변동률(%). 수집한 지 1시간이 안 됐으면 null */
  changeRate1h: number | null
  /** 마지막으로 확인한 시각. 가격이 같아도 수집할 때마다 바뀐다 */
  refreshedAt: string
  /** 관심 등록 여부 (M4) */
  watched: boolean
}

/** GET /api/items/{itemId} */
export type ItemDetail = Omit<ItemSummary, 'changeRate1h'> & {
  categoryCode: CategoryCode
  yesterdayAvgPrice: number | null
  /** 전일 대비 골드 */
  change: number | null
  todayLow: number | null
  todayHigh: number | null
  yesterdayTradeCount: number | null
  /** 가격이 마지막으로 바뀐 시각 */
  priceChangedAt: string
}

export type PricePoint = {
  time: string
  price: number
}

/** GET /api/items/{itemId}/prices (오늘 분 단위) */
export type ItemPrices = {
  itemId: number
  yesterdayAvgPrice: number | null
  points: PricePoint[]
}

export type DailyPrice = {
  date: string
  avgPrice: number
  tradeCount: number
  open: number | null
  high: number | null
  low: number | null
  close: number | null
}

/** GET /api/items/{itemId}/daily-prices (날짜 오름차순, 오늘 제외) */
export type ItemDailyPrices = {
  itemId: number
  days: DailyPrice[]
}

/** 랭킹의 한 줄. 아이템 등급은 05-api 요약에 없지만 썸네일의 등급 색에 필요해 더했다 */
export type RankingEntry = {
  rank: number
  item: {
    id: number
    name: string
    grade: string
    categoryName: string
    iconUrl: string | null
  }
  currentPrice: number
  /** 최근 1시간 변동률(%) */
  changeRate1h: number
}

/** GET /api/rankings, SSE ranking 이벤트 (30초마다 계산, D12) */
export type Rankings = {
  rising: RankingEntry[]
  falling: RankingEntry[]
  calculatedAt: string
}

export type ServiceStatus = 'NORMAL' | 'DELAYED' | 'MAINTENANCE'

/** GET /api/collection/summary (수집 신선도 띠) */
export type CollectionSummary = {
  serviceStatus: ServiceStatus
  avgReflectionDelaySeconds: number | null
  collectedItemCount: number
  apiCallsRemaining: number
  apiCallsLimit: number
  measuredAt: string
}
