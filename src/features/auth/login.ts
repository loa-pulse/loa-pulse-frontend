import { apiUrl } from '@/api/client'
import { env } from '@/lib/env'

/**
 * 로그인이 끝나고 돌아올 경로. 다른 사이트로 보내는 주소(`//evil.com`, `https://...`)는
 * 받지 않고 메인으로 돌린다 (백엔드도 같은 검사를 한다).
 */
export function safeReturnTo(path: string | null | undefined): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return '/'
  return path
}

/** 지금 보고 있는 화면의 경로 (쿼리 포함) */
export function currentPath(): string {
  return `${window.location.pathname}${window.location.search}`
}

/**
 * 디스코드 로그인을 시작한다 (05-api `GET /api/auth/login?returnTo=`).
 * 백엔드가 디스코드 동의 화면을 거쳐 `returnTo`로 돌려보낸다.
 * 목업에서는 OAuth가 없으므로 바로 로그인 상태로 바꾸고 `returnTo`로 간다.
 */
export async function startLogin(returnTo: string = currentPath()) {
  const target = safeReturnTo(returnTo)
  if (env.useMock) {
    const { mockAccount } = await import('@/mocks/data/account')
    mockAccount.logIn()
    window.location.assign(target)
    return
  }
  window.location.assign(
    apiUrl('/api/auth/login', { returnTo: target }).toString(),
  )
}
