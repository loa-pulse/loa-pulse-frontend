import { TriangleAlertIcon } from 'lucide-react'
import type { ServiceStatus } from '@/api/schema'
import { useRealtimeStatus } from '../realtime-context'

const messages: Record<
  Exclude<ServiceStatus, 'NORMAL'>,
  { title: string; description: string }
> = {
  DELAYED: {
    title: '시세 수집이 지연되고 있어요',
    description:
      '마지막으로 확인한 시세를 보여 주고 있어요. 수집이 회복되면 바로 따라잡아요.',
  },
  MAINTENANCE: {
    title: '로스트아크 정기 점검 중이에요',
    description: '점검 동안은 수집을 멈추고 마지막 시세를 보여 줘요.',
  },
}

/**
 * 서비스 상태 배너 (기획 4.1, 05-api freshness). 수집 지연이나 게임 점검일 때 헤더 아래에 띄운다.
 * 모양은 Figma Banner/Warning을 따른다.
 */
export function ServiceStatusBanner() {
  const { serviceStatus } = useRealtimeStatus()
  if (serviceStatus === 'NORMAL') return null
  const message = messages[serviceStatus]

  return (
    <div
      role="status"
      className="border-b border-status-warning/40 bg-status-warning-subtle"
    >
      <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-6 py-3">
        <TriangleAlertIcon
          aria-hidden="true"
          className="size-5 shrink-0 text-status-warning"
        />
        <div>
          <p className="text-sm font-medium">{message.title}</p>
          <p className="text-xs text-muted-foreground">{message.description}</p>
        </div>
      </div>
    </div>
  )
}
