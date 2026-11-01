import { AlertRowActions } from '@/features/alerts/components/alert-row-actions'
import { AlertUsage } from '@/features/alerts/components/alert-usage'
import { RegisteredAlerts } from '@/features/alerts/components/registered-alerts'
import { RequireLogin } from '@/features/auth/components/require-login'
import { useAuth } from '@/features/auth/queries'

/** 내 알림 (/alerts, 로그인 필요). Figma "My Alerts /alerts" */
function AlertsPage() {
  const { me } = useAuth()

  return (
    <>
      <title>내 알림 · LoaPulse</title>
      <div className="flex flex-col gap-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[28px] leading-9 font-bold">내 알림</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              조건을 만족하면 디스코드 DM으로 한 번 알려 드려요
            </p>
          </div>
          {me && (
            <AlertUsage
              active={me.activeAlertCount}
              limit={me.activeAlertLimit}
            />
          )}
        </div>
        <RequireLogin description="로그인하면 등록한 알림과 받은 알림 내역을 볼 수 있어요">
          {() => (
            <RegisteredAlerts
              renderActions={(alert) => <AlertRowActions alert={alert} />}
            />
          )}
        </RequireLogin>
      </div>
    </>
  )
}

export default AlertsPage
