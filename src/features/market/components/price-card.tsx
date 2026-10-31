import type { ReactNode } from 'react'
import { ClockIcon } from 'lucide-react'
import type { ItemDetail } from '@/api/schema'
import { PriceChange } from '@/components/price-change'
import { changeDirection, formatCount, formatGold } from '@/lib/format/number'
import { formatKstTime, formatRelativeTime } from '@/lib/format/time'
import { cn } from '@/lib/utils'
import { isStale } from '../item-display'

type PriceCardProps = {
  item: ItemDetail
  now: Date
  /** 오른쪽 위 실시간 연결 표시 (2단계) */
  liveIndicator?: ReactNode
}

/** "▲ 1.6 G 전일 대비". 전일 평균가가 없으면 보여주지 않는다 */
function ChangeAmount({
  change,
  rate,
}: {
  change: number | null
  rate: number | null
}) {
  if (change === null || rate === null) return null
  const direction = changeDirection(rate)
  const arrow = direction === 'rise' ? '▲' : direction === 'fall' ? '▼' : '–'
  return (
    <span
      className={cn(
        'text-xs',
        direction === 'rise' && 'text-price-rise',
        direction === 'fall' && 'text-price-fall',
        direction === 'flat' && 'text-muted-foreground',
      )}
    >
      {arrow} {formatGold(Math.abs(change))} 전일 대비
    </span>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xl font-semibold tracking-tight tabular-nums">
        {value}
      </dd>
    </div>
  )
}

/** 아이템 상세의 가격 카드 (Figma Card/Price). 마지막 갱신 시각을 일부러 보여준다 (F2 기획 의도) */
export function PriceCard({ item, now, liveIndicator }: PriceCardProps) {
  const stale = isStale(item.refreshedAt, now)

  return (
    <section
      aria-label="현재 시세"
      className="flex flex-col gap-5 rounded-[14px] border bg-card p-6"
    >
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">현재 최저가</span>
          <div className="flex items-center gap-3">
            <span className="text-[40px] leading-[48px] font-semibold tracking-tight tabular-nums">
              {formatGold(item.currentPrice)}
            </span>
            <PriceChange rate={item.changeRate} />
            <ChangeAmount change={item.change} rate={item.changeRate} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {liveIndicator}
          <span
            className={cn(
              'flex items-center gap-1.5 text-xs',
              stale ? 'text-status-warning' : 'text-muted-foreground',
            )}
          >
            <ClockIcon aria-hidden="true" className="size-3.5" />
            마지막 갱신 {formatRelativeTime(item.refreshedAt, now)} ·{' '}
            <time dateTime={item.refreshedAt}>
              {formatKstTime(item.refreshedAt, { withSeconds: true })}
            </time>
          </span>
        </div>
      </div>
      <hr className="border-border" />
      <dl className="flex gap-6">
        <Stat label="전일 평균가" value={formatGold(item.yesterdayAvgPrice)} />
        <Stat label="오늘 최저" value={formatGold(item.todayLow)} />
        <Stat label="오늘 최고" value={formatGold(item.todayHigh)} />
        <Stat
          label="어제 거래량"
          value={formatCount(item.yesterdayTradeCount)}
        />
      </dl>
    </section>
  )
}
