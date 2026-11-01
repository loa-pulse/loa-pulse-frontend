import type { PricePoint, WatchItem } from '@/api/schema'
import { mockAccount } from './account'
import { findSeed, toPrices, toSummary } from './market'

/**
 * 목업 관심 아이템. 계정 목업처럼 브라우저 저장소에 아이템 ID를 남긴다.
 * 처음에는 메인 카드를 바로 볼 수 있게 예시 4개로 시작한다.
 */
const STORAGE_KEY = 'loapulse.mock.watch'
const SEED_IDS = [66102007, 65200505, 66102005, 65203505]

function load(): number[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? (JSON.parse(saved) as number[]) : SEED_IDS
  } catch {
    return SEED_IDS
  }
}

function save(ids: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

/** 분 단위 추이를 시간별 최저가로 줄인다 (05-api: 오늘 추이는 시간별 최저가 점) */
function hourlyLows(points: PricePoint[]): PricePoint[] {
  const byHour = new Map<string, PricePoint>()
  for (const point of points) {
    const hour = `${point.time.slice(0, 13)}:00:00.000Z`
    const current = byHour.get(hour)
    if (!current || point.price < current.price) {
      byHour.set(hour, { time: hour, price: point.price })
    }
  }
  return [...byHour.values()]
}

export const mockWatch = {
  /** 로그인하지 않았으면 아무것도 관심 등록돼 있지 않다 */
  has: (itemId: number) =>
    mockAccount.get().loggedIn && load().includes(itemId),

  add(itemId: number) {
    const ids = load()
    if (!ids.includes(itemId)) save([...ids, itemId])
  },

  remove(itemId: number) {
    save(load().filter((id) => id !== itemId))
  },

  list(now: Date): WatchItem[] {
    return load().flatMap((id) => {
      const seed = findSeed(id)
      if (!seed) return []
      const summary = toSummary(seed, now)
      return [
        {
          item: {
            id,
            name: summary.name,
            grade: summary.grade,
            categoryName: summary.categoryName,
            iconUrl: summary.iconUrl,
          },
          currentPrice: summary.currentPrice,
          changeRate: summary.changeRate,
          todayPoints: hourlyLows(toPrices(seed, now).points),
        },
      ]
    })
  },

  reset() {
    localStorage.removeItem(STORAGE_KEY)
  },
}
