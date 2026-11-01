import { RequireLogin } from '@/features/auth/components/require-login'
import { AccountCard } from '@/features/settings/components/account-card'
import { DeleteAccountCard } from '@/features/settings/components/delete-account-card'
import { DmTestCard } from '@/features/settings/components/dm-test-card'
import { NotificationSettingsCard } from '@/features/settings/components/notification-settings-card'

/** 설정 (/settings, 로그인 필요). Figma "Settings /settings" */
function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-6">
      <title>설정 · LoaPulse</title>
      <div className="mb-2">
        <h1 className="text-[28px] leading-9 font-bold">설정</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          디스코드 계정과 알림 수신 방법을 관리해요
        </p>
      </div>
      <RequireLogin description="로그인하면 디스코드 계정과 알림 수신 방법을 관리할 수 있어요">
        {(me) => (
          <>
            <AccountCard me={me} />
            <DmTestCard me={me} />
            <NotificationSettingsCard me={me} />
            <DeleteAccountCard />
          </>
        )}
      </RequireLogin>
    </div>
  )
}

export default SettingsPage
