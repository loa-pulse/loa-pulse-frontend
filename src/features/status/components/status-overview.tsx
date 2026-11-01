import type { ServiceStatus } from '@/api/schema'
import { formatKstTime } from '@/lib/format/time'
import { cn } from '@/lib/utils'

const labels: Record<
  ServiceStatus,
  { text: string; tone: string; dot: string }
> = {
  NORMAL: {
    text: '모든 시스템 정상',
    tone: 'bg-status-live-subtle text-status-live',
    dot: 'bg-status-live',
  },
  DELAYED: {
    text: '시세 수집 지연',
    tone: 'bg-status-warning-subtle text-status-warning',
    dot: 'bg-status-warning',
  },
  MAINTENANCE: {
    text: '게임 점검 중',
    tone: 'bg-status-warning-subtle text-status-warning',
    dot: 'bg-status-warning',
  },
}

type StatusOverviewProps = {
  status: ServiceStatus
  updatedAt: string
}

/** 상태 화면 오른쪽 위의 전체 상태 배지와 갱신 시각 (Figma 상태 화면) */
export function StatusOverview({ status, updatedAt }: StatusOverviewProps) {
  const label = labels[status]
  return (
    <div className="flex flex-col items-end gap-2">
      <p
        className={cn(
          'flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium',
          label.tone,
        )}
      >
        <span
          aria-hidden="true"
          className={cn('size-2 rounded-full', label.dot)}
        />
        {label.text}
      </p>
      <p className="text-xs text-muted-foreground">
        1분마다 갱신 · 마지막{' '}
        <time dateTime={updatedAt}>{formatKstTime(updatedAt)}</time>
      </p>
    </div>
  )
}
