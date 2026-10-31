/** 설정 (/settings, 로그인 필요). 디스코드 계정, DM 수신 확인, 알림 받기, 회원 탈퇴 */
function SettingsPage() {
  return (
    <div className="mx-auto max-w-[720px]">
      <title>설정 · LoaPulse</title>
      <h1 className="text-[28px] leading-9 font-bold">설정</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        디스코드 계정과 알림 수신 방법을 관리해요
      </p>
    </div>
  )
}

export default SettingsPage
