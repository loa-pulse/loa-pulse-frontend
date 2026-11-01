/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 백엔드 주소. 비워 두면 같은 출처의 /api를 쓴다 (로컬 개발은 Vite 프록시) */
  readonly VITE_API_BASE_URL?: string
  /** "true"면 MSW 목업으로 API와 SSE를 흉내 낸다 (로컬, Vercel 프리뷰) */
  readonly VITE_USE_MOCK?: string
  /** LoaPulse 디스코드 서버 초대 링크 (서버 다시 참여 버튼) */
  readonly VITE_DISCORD_INVITE_URL?: string
  /** Grafana 공개 대시보드 주소 (상태 화면 임베드) */
  readonly VITE_GRAFANA_DASHBOARD_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
