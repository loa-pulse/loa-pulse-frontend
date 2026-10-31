import { cn } from '@/lib/utils'

/** 알림 상태(API)와 발송 실패 표시 */
export type BadgeStatus = 'ACTIVE' | 'PAUSED' | 'TRIGGERED' | 'FAILED'

const styles: Record<BadgeStatus, { className: string; label: string }> = {
  ACTIVE: {
    className: 'bg-status-live-subtle text-status-live',
    label: '활성',
  },
  PAUSED: { className: 'bg-muted text-muted-foreground', label: '일시정지' },
  TRIGGERED: {
    className: 'bg-price-fall-subtle text-price-fall',
    label: '발송 완료',
  },
  FAILED: {
    className: 'bg-price-rise-subtle text-destructive',
    label: '발송 실패',
  },
}

type StatusBadgeProps = {
  status: BadgeStatus
  className?: string
}

/** 알림 상태 배지 (Figma StatusBadge) */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = styles[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs whitespace-nowrap',
        style.className,
        className,
      )}
    >
      {style.label}
    </span>
  )
}
