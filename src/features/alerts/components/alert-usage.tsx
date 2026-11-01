import { cn } from '@/lib/utils'

type AlertUsageProps = {
  active: number
  limit: number
}

/** 활성 알림 사용량 막대 (Figma 내 알림 오른쪽 위). 한도에 가까우면 주황, 다 차면 빨강 */
export function AlertUsage({ active, limit }: AlertUsageProps) {
  const ratio = Math.min(1, active / limit)

  return (
    <div className="flex w-36 flex-col items-end gap-2">
      <p className="text-xs font-medium tabular-nums">
        활성 알림 {active} / {limit}
      </p>
      <div
        role="progressbar"
        aria-label="활성 알림 사용량"
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={active}
        className="h-1 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn(
            'h-full rounded-full bg-status-live',
            ratio >= 0.8 && 'bg-status-warning',
            ratio >= 1 && 'bg-destructive',
          )}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  )
}
