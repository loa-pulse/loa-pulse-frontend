import { apiRequest } from '@/api/client'
import type { DmTestResult, Me, SettingsRequest } from '@/api/schema'

/** 설정 API (05-api M3). 모두 로그인 필요 */
export const settingsApi = {
  update: (body: SettingsRequest) =>
    apiRequest<Me>('PATCH', '/api/me/settings', { body }),

  /** 테스트 DM을 보내고 결과(DM 수신 상태)를 돌려준다 */
  dmTest: () => apiRequest<DmTestResult>('POST', '/api/me/dm-test'),

  /** 회원 탈퇴. 계정, 알림, 관심 아이템, 알림 내역을 바로 삭제한다 (D19) */
  deleteAccount: () => apiRequest<void>('DELETE', '/api/me'),
}
