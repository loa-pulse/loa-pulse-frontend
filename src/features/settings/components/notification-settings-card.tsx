import { useId } from 'react'
import { toast } from 'sonner'
import type { Me } from '@/api/schema'
import { Switch } from '@/components/ui/switch'
import { useUpdateSettings } from '../queries'

/**
 * 설정의 "알림 받기" 카드. 급변동 알림 구독(F11, 기획 4.3)만 둔다.
 * Figma의 "웹 알림" 전체 토글은 알림마다 받을 곳을 고르므로 뺐다 (05-api 정해야 할 것, 2026-11-01).
 */
export function NotificationSettingsCard({ me }: { me: Me }) {
  const update = useUpdateSettings()
  const ids = { label: useId(), description: useId() }

  const toggle = (subscribed: boolean) =>
    update.mutate(
      { surgeAlertSubscribed: subscribed },
      {
        onSuccess: () =>
          toast.success(
            subscribed ? '급변동 알림을 켰어요' : '급변동 알림을 껐어요',
          ),
        onError: () => toast.error('설정을 바꾸지 못했어요'),
      },
    )

  return (
    <section
      aria-labelledby="notification-settings"
      className="flex flex-col gap-4 rounded-[14px] border bg-card p-6"
    >
      <h2 id="notification-settings" className="text-base font-bold">
        알림 받기
      </h2>
      <div className="flex items-center gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <p id={ids.label} className="text-sm font-medium">
            급변동 알림
          </p>
          <p id={ids.description} className="text-xs text-muted-foreground">
            1시간 안에 10% 넘게 움직인 아이템을 디스코드 DM으로 알려 드려요.
            같은 아이템은 1시간에 한 번만 보내요.
          </p>
        </div>
        <Switch
          aria-labelledby={ids.label}
          aria-describedby={ids.description}
          checked={me.surgeAlertSubscribed}
          disabled={update.isPending}
          onCheckedChange={toggle}
        />
      </div>
    </section>
  )
}
