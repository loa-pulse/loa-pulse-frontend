/**
 * 백엔드 API 응답 타입.
 *
 * 지금은 loa-pulse-docs `design/05-api.md`의 계약을 보고 직접 쓴 타입이다.
 * 백엔드 OpenAPI(`openapi.json`)가 나오면 openapi-typescript 생성 타입으로 바꾼다
 * (08-frontend-plan 1-13). 화면 코드는 이 파일의 타입만 참조한다.
 *
 * 규칙 (05-api.md "형식"): 시각은 UTC ISO-8601, 날짜는 KST `yyyy-MM-dd`,
 * 가격은 `bundleCount`개 묶음 기준 골드, 값이 없으면 null.
 */

/** 목록 응답. 페이지는 1부터 */
export type Page<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/** 시세 목록 탭 */
export type CategoryCode =
  | 'all'
  | 'refining'
  | 'refining-extra'
  | 'engraving'
  | 'battle'
  | 'life'
  | 'cooking'
  | 'etc'

export type Category = {
  code: CategoryCode
  name: string
  itemCount: number
}

export type ItemSort =
  | 'default'
  | 'change-desc'
  | 'change-asc'
  | 'change1h-desc'
  | 'change1h-asc'
  | 'price-desc'
  | 'price-asc'

/** GET /api/items 의 한 행 */
export type ItemSummary = {
  id: number
  name: string
  /** 한글 등급 이름 (예: "유물") */
  grade: string
  categoryName: string
  iconUrl: string | null
  bundleCount: number
  /** 현재 최저가 */
  currentPrice: number
  /** 전일 대비 변동률(%). 전일 평균가가 없으면 null */
  changeRate: number | null
  /** 최근 1시간 변동률(%). 수집한 지 1시간이 안 됐으면 null */
  changeRate1h: number | null
  /** 마지막으로 확인한 시각. 가격이 같아도 수집할 때마다 바뀐다 */
  refreshedAt: string
  /** 관심 등록 여부 (M4) */
  watched: boolean
}

/** GET /api/items/{itemId} */
export type ItemDetail = Omit<ItemSummary, 'changeRate1h'> & {
  categoryCode: CategoryCode
  yesterdayAvgPrice: number | null
  /** 전일 대비 골드 */
  change: number | null
  todayLow: number | null
  todayHigh: number | null
  yesterdayTradeCount: number | null
  /** 가격이 마지막으로 바뀐 시각 */
  priceChangedAt: string
}

export type PricePoint = {
  time: string
  price: number
}

/** GET /api/items/{itemId}/prices (오늘 분 단위) */
export type ItemPrices = {
  itemId: number
  yesterdayAvgPrice: number | null
  points: PricePoint[]
}

export type DailyPrice = {
  date: string
  avgPrice: number
  tradeCount: number
  open: number | null
  high: number | null
  low: number | null
  close: number | null
}

/** GET /api/items/{itemId}/daily-prices (날짜 오름차순, 오늘 제외) */
export type ItemDailyPrices = {
  itemId: number
  days: DailyPrice[]
}

/** 랭킹의 한 줄. 아이템 등급은 05-api 요약에 없지만 썸네일의 등급 색에 필요해 더했다 */
export type RankingEntry = {
  rank: number
  item: {
    id: number
    name: string
    grade: string
    categoryName: string
    iconUrl: string | null
  }
  currentPrice: number
  /** 최근 1시간 변동률(%) */
  changeRate1h: number
}

/** GET /api/rankings, SSE ranking 이벤트 (30초마다 계산, D12) */
export type Rankings = {
  rising: RankingEntry[]
  falling: RankingEntry[]
  calculatedAt: string
}

export type ServiceStatus = 'NORMAL' | 'DELAYED' | 'MAINTENANCE'

/** GET /api/collection/summary (수집 신선도 띠) */
export type CollectionSummary = {
  serviceStatus: ServiceStatus
  avgReflectionDelaySeconds: number | null
  collectedItemCount: number
  apiCallsRemaining: number
  apiCallsLimit: number
  measuredAt: string
}

/**
 * DM 수신 상태 (기획 4.4 "DM 실패 대비책").
 * 아직 확인하지 않음, 정상, 서버를 나감, 서버 멤버 DM을 막음
 */
export type DmStatus = 'UNKNOWN' | 'OK' | 'LEFT_GUILD' | 'DM_BLOCKED'

/** GET /api/me. 로그인하지 않았으면 401 (M3 필드 요약 기준) */
export type Me = {
  discordId: string
  nickname: string
  avatarUrl: string | null
  joinedAt: string
  /** LoaPulse 디스코드 서버 참여 여부 */
  guildMember: boolean
  dmStatus: DmStatus
  lastDmTestAt: string | null
  /** 급변동 알림 구독 (F11) */
  surgeAlertSubscribed: boolean
  activeAlertCount: number
  activeAlertLimit: number
}

/** 수집 등급. 관심 등록과 알림이 많고 자주 바뀌는 아이템일수록 자주 수집한다 */
export type CollectionTier = 'HOT' | 'NORMAL' | 'COLD'

/** 핵심 지표 (Figma 상태 화면 위 카드 4개). 측정값이 없으면 null */
export type StatusMetrics = {
  /** Hot 아이템 반영 지연 p95(초). 목표 30초 */
  hotDelayP95Seconds: number | null
  /** 같은 지표의 M1 기준선(모든 아이템을 같은 주기로 수집했을 때) */
  hotDelayBaselineSeconds: number | null
  /** 호출 효율: 새 값을 받은 호출 비율(%) */
  callEfficiencyPercent: number | null
  callEfficiencyBaselinePercent: number | null
  /** 최근 30일 API 호출 한도(분당 100회) 초과 횟수 */
  rateLimitExceededCount: number
  /** 목표가 알림 발송 지연 p95(초). 목표 60초 */
  alertDelayP95Seconds: number | null
  /** 최근 30일 중복 발송 수 */
  duplicateAlertCount: number
}

export type TierStatus = {
  tier: CollectionTier
  itemCount: number
  intervalSeconds: number
  avgDelaySeconds: number | null
}

export type Incident = {
  id: number
  title: string
  startedAt: string
  /** 진행 중이면 null */
  durationMinutes: number | null
  description: string
  resolved: boolean
}

/** GET /api/status (F12, D30) */
export type ServiceHealth = {
  serviceStatus: ServiceStatus
  updatedAt: string
  metrics: StatusMetrics
  tiers: TierStatus[]
  /** 최근 30일, 최신순 */
  incidents: Incident[]
}

/** GET /api/me/watch-items의 한 항목 (메인 "내 관심 아이템" 카드) */
export type WatchItem = {
  item: {
    id: number
    name: string
    grade: string
    categoryName: string
    iconUrl: string | null
  }
  currentPrice: number | null
  /** 전일 평균가 대비 변동률(%) */
  changeRate: number | null
  /** 오늘 추이. 시간별 최저가 점 (스파크라인) */
  todayPoints: PricePoint[]
}

/** PATCH /api/me/settings 요청. 응답은 바뀐 Me */
export type SettingsRequest = {
  surgeAlertSubscribed: boolean
}

/** POST /api/me/dm-test 응답 */
export type DmTestResult = {
  dmStatus: DmStatus
  testedAt: string
}

/** 이하가 되면 / 이상이 되면 */
export type AlertDirection = 'BELOW' | 'ABOVE'

/** 활성, 일시정지, 발송 완료(1회성, 기획 4.2) */
export type AlertStatus = 'ACTIVE' | 'PAUSED' | 'TRIGGERED'

/** 받을 곳 */
export type AlertChannels = { dm: boolean; web: boolean }

/** 알림·내역에 함께 오는 아이템 요약 */
export type AlertItem = {
  id: number
  name: string
  grade: string
  iconUrl: string | null
}

export type Alert = {
  id: number
  item: AlertItem & { currentPrice: number | null }
  direction: AlertDirection
  threshold: number
  channels: AlertChannels
  status: AlertStatus
  /** 발송 시각. 발송 전이면 null */
  triggeredAt: string | null
  createdAt: string
}

/** GET /api/alerts?status=&itemId= */
export type AlertList = {
  items: Alert[]
  counts: { all: number; active: number; paused: number; triggered: number }
  activeLimit: number
}

/** POST /api/alerts, PATCH /api/alerts/{alertId} 요청 */
export type AlertRequest = {
  itemId: number
  direction: AlertDirection
  threshold: number
  channels: AlertChannels
}

/** GET /api/notifications. 받은 알림 내역, 최근 30일 (F10) */
export type Notification = {
  id: number
  alertId: number
  item: AlertItem
  /** 발송 당시 가격 */
  price: number
  direction: AlertDirection
  threshold: number
  /** DM 결과. DM을 받을 곳으로 고르지 않았으면 null */
  dm: 'SENT' | 'FAILED' | null
  web: boolean
  createdAt: string
}
