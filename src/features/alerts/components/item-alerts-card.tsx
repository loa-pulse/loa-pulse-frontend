import { BellIcon, PlusIcon } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/queries'
import { channelsText, conditionText } from '../alert-display'
import { useAlerts } from '../queries'

type ItemAlertsCardProps = {
  itemId: number
  /** 새 알림 추가 (로그인 전이면 로그인 안내) */
  onAdd: () => void
}

/** 아이템 상세의 "이 아이템 알림" 카드 (Figma "Item Detail + Alert Modal" 오른쪽) */
export function ItemAlertsCard({ itemId, onAdd }: ItemAlertsCardProps) {
  const { me, isLoggedIn } = useAuth()
  const alerts = useAlerts({ itemId }, isLoggedIn)

  return (
    <section
      aria-labelledby="item-alerts-title"
      className="flex flex-col gap-3 rounded-[14px] border bg-card p-5"
    >
      <h2
        id="item-alerts-title"
        className="flex items-center gap-2 text-base font-bold"
      >
        <BellIcon aria-hidden="true" className="size-4" />이 아이템 알림
      </h2>

      {!isLoggedIn && (
        <p className="text-[13px] text-muted-foreground">
          로그인하면 원하는 가격이 됐을 때 디스코드 DM으로 알려 드려요
        </p>
      )}

      {isLoggedIn && alerts.isPending && <Skeleton className="h-14 w-full" />}

      {alerts.data && alerts.data.items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {alerts.data.items.map((alert) => (
            <li
              key={alert.id}
              className="flex items-center justify-between rounded-lg bg-background px-3 py-2.5"
            >
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium tabular-nums">
                  {conditionText(alert.direction, alert.threshold)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {channelsText(alert.channels)}
                </span>
              </span>
              <StatusBadge status={alert.status} />
            </li>
          ))}
        </ul>
      )}

      <Button variant="outline" size="lg" onClick={onAdd}>
        <PlusIcon aria-hidden="true" />새 알림 추가
      </Button>

      {me && (
        <p className="text-xs text-muted-foreground">
          활성 알림은 계정당 {me.activeAlertLimit}개까지 등록할 수 있어요 (현재{' '}
          {me.activeAlertCount}개)
        </p>
      )}
    </section>
  )
}
