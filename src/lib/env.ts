/**
 * 배포 환경별 설정 (D28).
 *
 * | 환경 | VITE_API_BASE_URL | VITE_USE_MOCK |
 * |---|---|---|
 * | 로컬 (백엔드 함께 실행) | 비움 → Vite 프록시 | 비움 |
 * | 로컬 (목업) | 비움 | true |
 * | Vercel 프리뷰 | 비움 | true (프리뷰 주소에서는 로그인이 되지 않는다) |
 * | Vercel 운영 | https://api.{도메인} | 비움 |
 */
export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, ''),
  useMock: import.meta.env.VITE_USE_MOCK === 'true',
  /** LoaPulse 디스코드 서버 초대 링크. 서버를 나간 사용자에게 보여준다 (기획 4.4) */
  discordInviteUrl: import.meta.env.VITE_DISCORD_INVITE_URL || null,
  /** 상태 화면에 임베드할 Grafana 공개 대시보드 주소 (D22, D30) */
  grafanaDashboardUrl: import.meta.env.VITE_GRAFANA_DASHBOARD_URL || null,
}
