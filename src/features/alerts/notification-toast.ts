import type { QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authKeys } from '@/features/auth/queries'
import type { NotificationEvent } from '@/features/realtime/events'
import { formatGold } from '@/lib/format/number'
import { withSubjectParticle } from '@/lib/korean'
import { conditionText } from './alert-display'
import { alertKeys } from './queries'

/** 토스트 문구. 디스코드 DM과 같은 말투 ("파괴석이 139 G가 됐어요") */
export function notificationMessage(event: NotificationEvent) {
  return {
    title: `${withSubjectParticle(event.item.name)} ${formatGold(event.price)}가 됐어요`,
    description: `조건 ${conditionText(event.direction, event.threshold)}`,
  }
}

/**
 * notification 이벤트 (05-api "SSE"). 웹 토스트를 띄우고, 알림이 '발송 완료'로 바뀌었으므로
 * 내 알림 목록과 내 정보(활성 알림 수)를 다시 받는다.
 */
export function applyNotificationEvent(
  queryClient: QueryClient,
  event: NotificationEvent,
  openItem: (itemId: number) => void,
) {
  const { title, description } = notificationMessage(event)
  toast(title, {
    id: `notification-${event.notificationId}`,
    description,
    duration: 10_000,
    action: { label: '보기', onClick: () => openItem(event.item.id) },
  })
  void queryClient.invalidateQueries({ queryKey: alertKeys.all })
  void queryClient.invalidateQueries({ queryKey: authKeys.me })
}
