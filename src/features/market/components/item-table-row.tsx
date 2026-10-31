import { Link, useNavigate } from 'react-router'
import { ChevronRightIcon } from 'lucide-react'
import type { ItemSummary } from '@/api/schema'
import { ItemThumb } from '@/components/item-thumb'
import { PriceChange } from '@/components/price-change'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatGold } from '@/lib/format/number'
import { formatRelativeTime } from '@/lib/format/time'
import { cn } from '@/lib/utils'
import { isStale, itemCaption } from '../item-display'

type ItemTableRowProps = {
  item: ItemSummary
  now: Date
}

/** 시세 표의 한 행 (Figma ItemTable/Row). 행 어디를 눌러도 상세로 이동한다 */
export function ItemTableRow({ item, now }: ItemTableRowProps) {
  const navigate = useNavigate()
  const detailPath = `/items/${item.id}`
  const stale = isStale(item.refreshedAt, now)

  return (
    <TableRow
      className="h-16 cursor-pointer"
      onClick={() => navigate(detailPath)}
    >
      <TableCell className="pl-4">
        <div className="flex items-center gap-3">
          <ItemThumb
            name={item.name}
            grade={item.grade}
            iconUrl={item.iconUrl}
          />
          <div className="flex flex-col gap-0.5">
            <Link
              to={detailPath}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-medium hover:underline"
            >
              {item.name}
            </Link>
            <span className="text-xs text-muted-foreground">
              {itemCaption(item.categoryName, item.bundleCount)}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right text-sm font-medium tabular-nums">
        {formatGold(item.currentPrice)}
      </TableCell>
      <TableCell className="text-right">
        <PriceChange rate={item.changeRate} />
      </TableCell>
      <TableCell className="text-right">
        <PriceChange rate={item.changeRate1h} />
      </TableCell>
      <TableCell
        className={cn(
          'text-right text-xs',
          stale ? 'text-status-warning' : 'text-muted-foreground',
        )}
      >
        <time dateTime={item.refreshedAt}>
          {formatRelativeTime(item.refreshedAt, now)}
        </time>
      </TableCell>
      <TableCell className="w-10 pr-4">
        <ChevronRightIcon
          aria-hidden="true"
          className="size-4 text-muted-foreground"
        />
      </TableCell>
    </TableRow>
  )
}
