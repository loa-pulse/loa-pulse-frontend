import { cn } from '@/lib/utils'

export type LiveState = 'live' | 'reconnecting' | 'offline'

const styles: Record<LiveState, { dot: string; label: string }> = {
  live: {
    dot: 'bg-status-live shadow-[0_0_6px_var(--status-live)]',
    label: '실시간',
  },
  reconnecting: { dot: 'bg-status-warning animate-pulse', label: '재연결 중' },
  offline: { dot: 'bg-price-flat', label: '연결 끊김' },
}

type LiveIndicatorProps = {
  state: LiveState
  /** 기본 문구 대신 보여줄 문구 (예: "실시간 반영 중") */
  label?: string
  className?: string
}

/** 실시간 연결 상태 (Figma LiveIndicator) */
export function LiveIndicator({ state, label, className }: LiveIndicatorProps) {
  const style = styles[state]
  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center gap-2 text-xs text-muted-foreground',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('size-2 rounded-full', style.dot)}
      />
      {label ?? style.label}
    </span>
  )
}
