import type { BusinessDay, UTCTimestamp } from 'lightweight-charts'
import type { DailyPrice, PricePoint } from '@/api/schema'
import type { ChartPoint } from '@/components/price-chart'

/** 차트 라이브러리는 UTC로 눈금을 그리므로, KST로 보이게 9시간 옮긴다 */
const KST_OFFSET_SECONDS = 9 * 60 * 60

/** 오늘 분 단위 추이 → 차트 점 (KST 시각) */
export function intradayPoints(points: PricePoint[]): ChartPoint[] {
  return points.map((p) => ({
    time: (Math.floor(new Date(p.time).getTime() / 1000) +
      KST_OFFSET_SECONDS) as UTCTimestamp,
    value: p.price,
  }))
}

/** 일별 시세 → 차트 점. 2주 차트는 일별 평균가 선으로 그린다 (08-frontend-plan "정한 것") */
export function dailyPoints(days: DailyPrice[]): ChartPoint[] {
  return days.map((d) => {
    const [year, month, day] = d.date.split('-').map(Number)
    const time: BusinessDay = { year, month, day }
    return { time, value: d.avgPrice }
  })
}

/** 선 색: 처음보다 끝이 낮으면 하락(파랑), 아니면 상승(빨강) */
export function trendTone(points: ChartPoint[]): 'rise' | 'fall' {
  if (points.length < 2) return 'rise'
  return points.at(-1)!.value < points[0].value ? 'fall' : 'rise'
}
