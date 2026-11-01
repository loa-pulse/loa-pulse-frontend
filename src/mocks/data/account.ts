import { CSRF_COOKIE, readCsrfToken } from '@/api/csrf'
import type { DmStatus, Me } from '@/api/schema'

/**
 * 목업 계정 상태. 실제 로그인(디스코드 OAuth, 세션)이 없으므로 브라우저 저장소에 상태를 남겨
 * 새로고침해도 로그인이 유지되게 한다. 테스트는 매번 저장소를 비우므로 로그아웃 상태로 시작한다.
 */
const STORAGE_KEY = 'loapulse.mock.account'

type AccountState = {
  loggedIn: boolean
  dmStatus: DmStatus
  lastDmTestAt: string | null
  surgeAlertSubscribed: boolean
}

const initialState: AccountState = {
  loggedIn: false,
  dmStatus: 'UNKNOWN',
  lastDmTestAt: null,
  surgeAlertSubscribed: false,
}

function load(): AccountState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...initialState, ...JSON.parse(saved) } : initialState
  } catch {
    return initialState
  }
}

function save(state: AccountState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const mockAccount = {
  get: load,
  update(patch: Partial<AccountState>) {
    save({ ...load(), ...patch })
  },
  /** 실제 로그인 응답처럼 세션과 함께 CSRF 쿠키가 생긴다 */
  logIn() {
    this.update({ loggedIn: true })
    issueCsrfCookie()
  },
  /** 로그아웃해도 설정은 남는다. 회원 탈퇴는 reset */
  logOut() {
    this.update({ loggedIn: false })
  },
  reset() {
    localStorage.removeItem(STORAGE_KEY)
  },
}

export const MOCK_CSRF_TOKEN = 'mock-csrf-token'

/** Spring Security처럼 XSRF-TOKEN 쿠키를 내려준다 */
export function issueCsrfCookie() {
  if (readCsrfToken() !== MOCK_CSRF_TOKEN) {
    document.cookie = `${CSRF_COOKIE}=${MOCK_CSRF_TOKEN}; path=/`
  }
}

export function mockMe(activeAlertCount: number): Me {
  const state = load()
  return {
    discordId: '123456789012345678',
    nickname: '모코코',
    avatarUrl: null,
    joinedAt: '2026-10-20T03:00:00Z',
    guildMember: state.dmStatus !== 'LEFT_GUILD',
    dmStatus: state.dmStatus,
    lastDmTestAt: state.lastDmTestAt,
    surgeAlertSubscribed: state.surgeAlertSubscribed,
    activeAlertCount,
    activeAlertLimit: 20,
  }
}
