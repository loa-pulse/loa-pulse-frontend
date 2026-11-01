import { RequireLogin } from '@/features/auth/components/require-login'

/** 내 알림 (/alerts, 로그인 필요). 등록한 알림, 받은 알림 내역 */
function AlertsPage() {
  return (
    <>
      <title>내 알림 · LoaPulse</title>
      <h1 className="text-[28px] leading-9 font-bold">내 알림</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        조건을 만족하면 디스코드 DM으로 한 번 알려 드려요
      </p>
      <RequireLogin description="로그인하면 등록한 알림과 받은 알림 내역을 볼 수 있어요">
        {() => null}
      </RequireLogin>
    </>
  )
}

export default AlertsPage
