/** 서비스 상태 (/status). 핵심 지표, 반영 지연 추이(Grafana), 등급별 수집 현황, 최근 장애 */
function StatusPage() {
  return (
    <>
      <title>서비스 상태 · LoaPulse</title>
      <h1 className="text-[28px] leading-9 font-bold">서비스 상태</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        LoaPulse가 시세를 얼마나 빠르고 정확하게 모으는지 그대로 공개해요
      </p>
    </>
  )
}

export default StatusPage
