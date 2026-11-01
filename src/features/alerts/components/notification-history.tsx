import type { Notification } from '@/api/schema'
import { ItemThumb } from '@/components/item-thumb'
import { QueryError } from '@/components/query-error'
import { StateMessage } from '@/components/state-message'
import { Skeleton } from '@/components/ui/skeleton'
import { formatGold } from '@/lib/format/number'
import { formatKstDateTime } from '@/lib/format/time'
import { withSubjectParticle } from '@/lib/korean'
import { cn } from '@/lib/utils'
import { conditionText } from '../alert-display'
import { useNotifications } from '../queries'

/** "디스코드 DM, 웹 발송", DM 실패면 "DM 실패 → 웹으로만 표시" (기획 4.2 발송 실패) */
function deliveryText(n: Notification): { text: string; failed: boolean } {
  if (n.dm === 'FAILED') {
    return {
      text: n.web ? 'DM 실패 → 웹으로만 표시' : 'DM 실패',
      failed: true,
    }
  }
  const sent = [n.dm === 'SENT' && '디스코드 DM', n.web && '웹'].filter(Boolean)
  return { text: `${sent.join(', ')} 발송`, failed: false }
}

function NotificationRow({ notification: n }: { notification: Notification }) {
  const delivery = deliveryText(n)

  return (
    <li className="flex items-center gap-4 px-4 py-3.5">
      <ItemThumb
        name={n.item.name}
        grade={n.item.grade}
        iconUrl={n.item.iconUrl}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-sm font-medium">
          {withSubjectParticle(n.item.name)} {formatGold(n.price)}가 됐어요
        </p>
        <p
          className={cn(
            'text-xs text-muted-foreground',
            delivery.failed && 'text-status-warning',
          )}
        >
          조건 {conditionText(n.direction, n.threshold)} · {delivery.text}
        </p>
      </div>
      <time
        dateTime={n.createdAt}
        className="text-xs text-muted-foreground tabular-nums"
      >
        {formatKstDateTime(n.createdAt)}
      </time>
    </li>
  )
}

/** 받은 알림 내역, 최근 30일 (F10, Figma 내 알림 아래) */
export function NotificationHistory() {
  const notifications = useNotifications()

  return (
    <section
      aria-labelledby="notification-history"
      className="flex flex-col gap-4"
    >
      <h2
        id="notification-history"
        className="flex items-baseline gap-2 text-lg font-bold"
      >
        받은 알림 내역
        <span className="text-xs font-normal text-muted-foreground">
          최근 30일
        </span>
      </h2>
      <div className="rounded-[14px] border bg-card">
        {notifications.isPending && (
          <div aria-busy="true" className="flex flex-col gap-2 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {notifications.isError && (
          <QueryError
            error={notifications.error}
            onRetry={() => notifications.refetch()}
          />
        )}
        {notifications.data?.length === 0 && (
          <StateMessage
            type="empty"
            title="최근 30일 동안 받은 알림이 없어요"
            description="조건을 만족하면 여기에 기록이 남아요"
          />
        )}
        {notifications.data && notifications.data.length > 0 && (
          <ul className="divide-y">
            {notifications.data.map((n) => (
              <NotificationRow key={n.id} notification={n} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
