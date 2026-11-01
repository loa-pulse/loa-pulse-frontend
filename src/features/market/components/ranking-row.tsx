import { Link } from 'react-router'
import type { RankingEntry } from '@/api/schema'
import { ItemThumb } from '@/components/item-thumb'
import { PriceChange } from '@/components/price-change'
import { formatGold } from '@/lib/format/number'

/** 랭킹의 한 줄 (Figma RankingList/Row). 줄 전체가 상세로 가는 링크다 */
export function RankingRow({ entry }: { entry: RankingEntry }) {
  const { item } = entry

  return (
    <li>
      <Link
        to={`/items/${item.id}`}
        className="flex h-14 items-center gap-3 rounded-lg px-3 hover:bg-muted/50"
      >
        <span className="w-5 text-center text-sm font-bold text-muted-foreground tabular-nums">
          {entry.rank}
        </span>
        <ItemThumb name={item.name} grade={item.grade} iconUrl={item.iconUrl} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-medium">{item.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {item.categoryName}
          </span>
        </span>
        <span className="text-sm font-medium tabular-nums">
          {formatGold(entry.currentPrice)}
        </span>
        <PriceChange
          rate={entry.changeRate1h}
          className="w-[72px] justify-end"
        />
      </Link>
    </li>
  )
}
