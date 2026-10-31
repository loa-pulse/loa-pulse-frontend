import { useMemo, useState } from 'react'
import { RotateCwIcon } from 'lucide-react'
import { PriceChart } from '@/components/price-chart'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatGold } from '@/lib/format/number'
import { dailyPoints, intradayPoints, trendTone } from '../chart-data'
import { useDailyPrices, usePrices } from '../queries'

type Range = 'today' | 'two-weeks'

const CHART_HEIGHT = 260

type PriceChartCardProps = {
  itemId: number
  itemName: string
}

function ChartError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground"
      style={{ height: CHART_HEIGHT }}
    >
      시세 추이를 불러오지 못했어요
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RotateCwIcon aria-hidden="true" />
        다시 시도
      </Button>
    </div>
  )
}

/** 시세 추이 카드 (Figma Card/Chart). 오늘은 분 단위 최저가, 2주는 일별 평균가 */
export function PriceChartCard({ itemId, itemName }: PriceChartCardProps) {
  const [range, setRange] = useState<Range>('today')
  const today = usePrices(itemId)
  const daily = useDailyPrices(itemId)
  const query = range === 'today' ? today : daily

  const points = useMemo(() => {
    if (range === 'today')
      return today.data ? intradayPoints(today.data.points) : []
    return daily.data ? dailyPoints(daily.data.days) : []
  }, [range, today.data, daily.data])

  const yesterdayAvg = today.data?.yesterdayAvgPrice ?? null
  const baseline = useMemo(
    () =>
      range === 'today' && yesterdayAvg !== null
        ? { price: yesterdayAvg, title: '전일 평균' }
        : null,
    [range, yesterdayAvg],
  )

  return (
    <section
      aria-label="시세 추이"
      className="flex flex-col gap-4 rounded-[14px] border bg-card p-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">시세 추이</h2>
        <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
          <TabsList aria-label="기간">
            <TabsTrigger value="today" className="px-3 text-[13px]">
              오늘 · 분 단위
            </TabsTrigger>
            <TabsTrigger value="two-weeks" className="px-3 text-[13px]">
              2주 · 일별
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {query.isPending && (
        <Skeleton className="w-full" style={{ height: CHART_HEIGHT }} />
      )}
      {query.isError && <ChartError onRetry={() => query.refetch()} />}
      {query.isSuccess && (
        <PriceChart
          points={points}
          baseline={baseline}
          tone={trendTone(points)}
          showTime={range === 'today'}
          height={CHART_HEIGHT}
          ariaLabel={`${itemName} ${range === 'today' ? '오늘 분 단위 최저가' : '최근 2주 일별 평균가'} 차트`}
        />
      )}

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-0.5 w-3.5 bg-price-rise" />
          {range === 'today' ? '최저가' : '일별 평균가'}
        </span>
        {baseline && (
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-px w-3.5 border-t border-dashed border-muted-foreground"
            />
            전일 평균가 {formatGold(baseline.price)}
          </span>
        )}
      </div>
    </section>
  )
}
