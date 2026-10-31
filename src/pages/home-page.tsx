import { FreshnessStrip } from '@/features/market/components/freshness-strip'

/** 메인 (/). 수집 신선도 띠, 급등락 랭킹(2단계), 내 관심 아이템(4단계) */
function HomePage() {
  return (
    <>
      <title>LoaPulse · 로스트아크 거래소 실시간 시세</title>
      <div className="flex flex-col gap-10">
        <FreshnessStrip />
        <div>
          <h1 className="text-[28px] leading-9 font-bold">실시간 급등락</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            최근 1시간 기준 · 30초마다 갱신
          </p>
        </div>
      </div>
    </>
  )
}

export default HomePage
