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
}
