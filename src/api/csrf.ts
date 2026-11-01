/**
 * CSRF 토큰 (05-api.md "CSRF"). Spring Security `CookieCsrfTokenRepository` 기본 방식이다.
 * 백엔드가 `XSRF-TOKEN` 쿠키(도메인 `.{도메인}`)로 내려준 값을 `X-XSRF-TOKEN` 헤더로 돌려보낸다.
 */
export const CSRF_COOKIE = 'XSRF-TOKEN'
export const CSRF_HEADER = 'X-XSRF-TOKEN'

/** 상태를 바꾸는 요청만 토큰이 필요하다 */
export function needsCsrf(method: string): boolean {
  return !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())
}

export function readCsrfToken(cookie = document.cookie): string | null {
  for (const part of cookie.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name === CSRF_COOKIE) return decodeURIComponent(rest.join('='))
  }
  return null
}
