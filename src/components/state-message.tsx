import type { ReactNode } from 'react'
import {
  BellIcon,
  SearchIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type StateMessageType = 'empty' | 'error' | 'no-result'

const defaults: Record<
  StateMessageType,
  { icon: LucideIcon; iconClass: string; title: string; description: string }
> = {
  empty: {
    icon: BellIcon,
    iconClass: 'bg-muted text-muted-foreground',
    title: '아직 아무것도 없어요',
    description: '',
  },
  error: {
    icon: TriangleAlertIcon,
    iconClass: 'bg-price-rise-subtle text-destructive',
    title: '정보를 불러오지 못했어요',
    description:
      '잠시 후 다시 시도해 주세요.\n문제가 계속되면 서비스 상태 페이지를 확인해 주세요',
  },
  'no-result': {
    icon: SearchIcon,
    iconClass: 'bg-muted text-muted-foreground',
    title: '검색 결과가 없어요',
    description: "'파괴석'처럼 아이템 이름의 일부로 검색해 보세요",
  },
}

type StateMessageProps = {
  type: StateMessageType
  title?: string
  description?: string
  icon?: LucideIcon
  /** 버튼 등 다음 행동 */
  action?: ReactNode
  className?: string
}

/** 빈 상태, 오류, 검색 결과 없음 안내 (Figma StateMessage) */
export function StateMessage({
  type,
  title,
  description,
  icon,
  action,
  className,
}: StateMessageProps) {
  const base = defaults[type]
  const Icon = icon ?? base.icon
  const desc = description ?? base.description

  return (
    <div
      role={type === 'error' ? 'alert' : undefined}
      className={cn(
        'flex flex-col items-center gap-3 px-6 py-12 text-center',
        className,
      )}
    >
      <span
        className={cn(
          'mb-1 flex size-12 items-center justify-center rounded-full',
          base.iconClass,
        )}
      >
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <p className="text-base font-bold text-foreground">
        {title ?? base.title}
      </p>
      {desc && (
        <p className="text-sm whitespace-pre-line text-muted-foreground">
          {desc}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
