import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { Alert } from '@/api/schema'
import { ItemThumb } from '@/components/item-thumb'
import { StatusBadge } from '@/components/status-badge'
import { formatGold } from '@/lib/format/number'
import { cn } from '@/lib/utils'
import { channelsText, conditionText } from '../alert-display'

function Labeled({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  )
}

type AlertRowProps = {
  alert: Alert
  /** 오른쪽 동작 버튼 (일시정지, 수정, 삭제) */
  actions?: ReactNode
}

/** 등록한 알림의 한 줄 (Figma 내 알림). 발송 완료는 흐리게 보여준다 */
export function AlertRow({ alert, actions }: AlertRowProps) {
  const { item } = alert

  return (
    <li
      className={cn(
        'grid h-16 grid-cols-[1fr_180px_160px_96px_112px] items-center gap-4 px-4',
        alert.status !== 'ACTIVE' && '[&>*:not(:last-child)]:opacity-60',
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <ItemThumb name={item.name} grade={item.grade} iconUrl={item.iconUrl} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <Link
            to={`/items/${item.id}`}
            className="truncate text-sm font-medium hover:underline"
          >
            {item.name}
          </Link>
          <span className="text-xs text-muted-foreground tabular-nums">
            현재 {formatGold(item.currentPrice)}
          </span>
        </div>
      </div>
      <Labeled
        label="조건"
        value={conditionText(alert.direction, alert.threshold)}
      />
      <Labeled label="받을 곳" value={channelsText(alert.channels)} />
      <div>
        <StatusBadge status={alert.status} />
      </div>
      <div className="flex justify-end gap-1">{actions}</div>
    </li>
  )
}
