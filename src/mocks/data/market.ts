import type {
  Category,
  CategoryCode,
  CollectionSummary,
  DailyPrice,
  ItemDailyPrices,
  ItemDetail,
  ItemPrices,
  ItemSummary,
  PricePoint,
} from '@/api/schema'

/**
 * 시세 목업 데이터.
 *
 * 아이템 정보(ID, 이름, 등급, 아이콘, 묶음)와 현재 최저가, 전일 평균가는 로스트아크 API의
 * 실제 응답이다 (loa-pulse-backend `src/test/resources/lostark/*.json`, 07-api-findings.md).
 * 직접 수집해야 나오는 값(1시간 변동률, 오늘 추이, 거래량 등)은 형식을 보여주기 위한 예시이며,
 * 테스트가 매번 같은 결과를 내도록 아이템 ID로 정해지는 값을 쓴다.
 */

type SeedItem = {
  id: number
  name: string
  grade: string
  bundleCount: number
  icon: string
  currentPrice: number
  yesterdayAvgPrice: number
  categoryCode: CategoryCode
}

const ICON = 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use'

const refining = (
  id: number,
  name: string,
  icon: string,
  currentPrice: number,
  yesterdayAvgPrice: number,
): SeedItem => ({
  id,
  name,
  grade: '일반',
  bundleCount: 100,
  icon: `${ICON}/${icon}.png`,
  currentPrice,
  yesterdayAvgPrice,
  categoryCode: 'refining',
})

const engraving = (
  id: number,
  name: string,
  currentPrice: number,
  yesterdayAvgPrice: number,
): SeedItem => ({
  id,
  name,
  grade: '유물',
  bundleCount: 1,
  icon: `${ICON}/use_9_25.png`,
  currentPrice,
  yesterdayAvgPrice,
  categoryCode: 'engraving',
})

const SEED: SeedItem[] = [
  refining(66102007, '운명의 파괴석 결정', 'use_13_249', 829, 894.5),
  refining(66102005, '정제된 파괴강석', 'use_11_15', 27, 22.6),
  refining(66102002, '파괴석', 'use_7_15', 30, 0),
  refining(66102102, '수호석', 'use_7_16', 19, 0),
  refining(66102004, '파괴강석', 'use_10_58', 4, 3.3),
  refining(66102105, '정제된 수호강석', 'use_11_16', 4, 3.3),
  refining(66102001, '파괴석 조각', 'use_8_250', 2, 1),
  refining(66102003, '파괴석 결정', 'use_6_105', 1, 1),
  refining(66102101, '수호석 조각', 'use_8_251', 1, 1),
  refining(66102103, '수호석 결정', 'use_6_104', 1, 1),
  refining(66102104, '수호강석', 'use_10_59', 1, 1),
  engraving(65203305, '유물 돌격대장 각인서', 110499, 106478.1),
  engraving(65201005, '유물 예리한 둔기 각인서', 108886, 106291.6),
  engraving(65200505, '유물 원한 각인서', 107998, 105474.6),
  engraving(65203905, '유물 아드레날린 각인서', 95000, 95203.9),
  engraving(65203505, '유물 질량 증가 각인서', 78799, 78027.0),
  engraving(65203005, '유물 기습의 대가 각인서', 40998, 41278.3),
]

export const CATEGORIES: Omit<Category, 'itemCount'>[] = [
  { code: 'all', name: '전체' },
  { code: 'refining', name: '재련 재료' },
  { code: 'refining-extra', name: '재련 추가 재료' },
  { code: 'engraving', name: '각인서' },
  { code: 'battle', name: '배틀 아이템' },
  { code: 'life', name: '생활 재료' },
  { code: 'cooking', name: '요리' },
  { code: 'etc', name: '기타' },
]

const categoryName = (code: CategoryCode) =>
  CATEGORIES.find((c) => c.code === code)!.name

const round = (value: number, digits: number) =>
  Math.round(value * 10 ** digits) / 10 ** digits

/** 아이템 ID와 순번으로 정해지는 -1 ~ 1 사이 값 (매번 같은 예시 값을 만들기 위함) */
function wave(id: number, n: number): number {
  return Math.sin(id * 0.001 + n * 0.37) * 0.6 + Math.sin(n * 1.13 + id) * 0.4
}

function changeRate(seed: SeedItem): number | null {
  if (seed.yesterdayAvgPrice === 0) return null
  return round(
    ((seed.currentPrice - seed.yesterdayAvgPrice) / seed.yesterdayAvgPrice) *
      100,
    2,
  )
}

/** 마지막 갱신이 몇 초 전인지. 일부 아이템은 1분이 넘게 해서 오래된 표시를 볼 수 있게 한다 */
function refreshedSecondsAgo(seed: SeedItem): number {
  return seed.id % 5 === 0 ? 75 + (seed.id % 90) : 3 + (seed.id % 40)
}

function secondsAgo(now: Date, seconds: number): string {
  return new Date(now.getTime() - seconds * 1000).toISOString()
}

export const MOCK_ITEM_IDS = SEED.map((s) => s.id)

export function findSeed(id: number): SeedItem | undefined {
  return SEED.find((s) => s.id === id)
}

export function toSummary(seed: SeedItem, now: Date): ItemSummary {
  const rate1h = seed.id % 7 === 0 ? null : round(wave(seed.id, 1) * 4, 2)
  return {
    id: seed.id,
    name: seed.name,
    grade: seed.grade,
    categoryName: categoryName(seed.categoryCode),
    iconUrl: seed.icon,
    bundleCount: seed.bundleCount,
    currentPrice: seed.currentPrice,
    changeRate: changeRate(seed),
    changeRate1h: rate1h,
    refreshedAt: secondsAgo(now, refreshedSecondsAgo(seed)),
    watched: false,
  }
}

export function itemsInCategory(code: CategoryCode): SeedItem[] {
  return code === 'all' ? SEED : SEED.filter((s) => s.categoryCode === code)
}

export function categoriesWithCount(): Category[] {
  return CATEGORIES.map((c) => ({
    ...c,
    itemCount: itemsInCategory(c.code).length,
  }))
}

export function toDetail(seed: SeedItem, now: Date): ItemDetail {
  const summary = toSummary(seed, now)
  const yesterday = seed.yesterdayAvgPrice === 0 ? null : seed.yesterdayAvgPrice
  const spread = Math.max(1, Math.round(seed.currentPrice * 0.02))
  return {
    id: summary.id,
    name: summary.name,
    grade: summary.grade,
    categoryCode: seed.categoryCode,
    categoryName: summary.categoryName,
    iconUrl: summary.iconUrl,
    bundleCount: summary.bundleCount,
    currentPrice: summary.currentPrice,
    yesterdayAvgPrice: yesterday,
    change: yesterday === null ? null : round(seed.currentPrice - yesterday, 1),
    changeRate: summary.changeRate,
    todayLow: Math.max(1, seed.currentPrice - spread),
    todayHigh: seed.currentPrice + spread,
    yesterdayTradeCount: 1000 + (seed.id % 997) * 1300,
    refreshedAt: summary.refreshedAt,
    priceChangedAt: secondsAgo(now, refreshedSecondsAgo(seed) + 180),
    watched: false,
  }
}

/** 오늘(KST 0시)부터 지금까지 1분 간격. 마지막 점이 현재가와 같다 */
export function toPrices(seed: SeedItem, now: Date): ItemPrices {
  const kstOffset = 9 * 60 * 60 * 1000
  const kstNow = new Date(now.getTime() + kstOffset)
  const kstMidnight = Date.UTC(
    kstNow.getUTCFullYear(),
    kstNow.getUTCMonth(),
    kstNow.getUTCDate(),
  )
  const start = kstMidnight - kstOffset
  const minutes = Math.max(1, Math.floor((now.getTime() - start) / 60_000))
  const amplitude = Math.max(1, seed.currentPrice * 0.015)

  const points: PricePoint[] = []
  for (let i = 0; i <= minutes; i++) {
    const fromEnd = minutes - i
    const price =
      i === minutes
        ? seed.currentPrice
        : Math.max(
            1,
            Math.round(
              seed.currentPrice +
                wave(seed.id, Math.floor(fromEnd / 7)) * amplitude,
            ),
          )
    points.push({ time: new Date(start + i * 60_000).toISOString(), price })
  }
  return {
    itemId: seed.id,
    yesterdayAvgPrice: seed.yesterdayAvgPrice || null,
    points,
  }
}

/** 최근 days일 (어제까지, 날짜 오름차순). 서비스 시작 전 날짜는 시가~종가가 없다 */
export function toDailyPrices(
  seed: SeedItem,
  now: Date,
  days: number,
): ItemDailyPrices {
  const base = seed.yesterdayAvgPrice || seed.currentPrice
  const result: DailyPrice[] = []
  for (let back = days; back >= 1; back--) {
    const date = new Date(now.getTime() + 9 * 3600_000 - back * 86_400_000)
    const avg =
      back === 1 ? base : round(base * (1 + wave(seed.id, back) * 0.04), 1)
    const collected = back <= 7
    result.push({
      date: date.toISOString().slice(0, 10),
      avgPrice: avg,
      tradeCount: 1000 + ((seed.id + back * 37) % 997) * 1300,
      open: collected ? Math.round(avg * 1.01) : null,
      high: collected ? Math.round(avg * 1.03) : null,
      low: collected ? Math.max(1, Math.round(avg * 0.97)) : null,
      close: collected ? Math.round(avg) : null,
    })
  }
  return { itemId: seed.id, days: result }
}

export function collectionSummary(now: Date): CollectionSummary {
  return {
    serviceStatus: 'NORMAL',
    avgReflectionDelaySeconds: 18,
    collectedItemCount: 646,
    apiCallsRemaining: 37,
    apiCallsLimit: 100,
    measuredAt: secondsAgo(now, 5),
  }
}
