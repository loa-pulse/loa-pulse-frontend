import { Link } from 'react-router'
import type { WatchItem } from '@/api/schema'
import { ItemThumb } from '@/components/item-thumb'
import { PriceChange } from '@/components/price-change'
import { Sparkline } from '@/components/sparkline'
import { formatGold } from '@/lib/format/number'

/** 메인의 관심 아이템 카드 (Figma "내 관심 아이템"). 카드 전체가 상세 링크다 */
export function WatchItemCard({ watch }: { watch: WatchItem }) {
  const { item } = watch

  return (
    <li>
      <Link
        to={`/items/${item.id}`}
        className="flex h-full flex-col gap-3 rounded-[14px] border bg-card p-4 hover:bg-muted/40"
      >
        <span className="flex items-center gap-3">
          <ItemThumb
            name={item.name}
            grade={item.grade}
            iconUrl={item.iconUrl}
          />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-medium">{item.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {item.categoryName}
            </span>
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span className="text-lg font-bold tabular-nums">
            {formatGold(watch.currentPrice)}
          </span>
          <PriceChange rate={watch.changeRate} />
        </span>
        <Sparkline points={watch.todayPoints} />
      </Link>
    </li>
  )
}
