import { HttpResponse } from 'msw'
import { CSRF_HEADER } from '@/api/csrf'
import { MOCK_CSRF_TOKEN, mockAccount } from '../data/account'

/** 실제 백엔드와 같은 ProblemDetail 오류 (05-api "오류") */
export function problem(status: number, detail: string, code?: string) {
  const titles: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
  }
  return HttpResponse.json(
    { type: 'about:blank', title: titles[status], status, detail, code },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  )
}

/**
 * 로그인과 CSRF 검사. 통과하면 null, 아니면 백엔드와 같은 오류 응답을 돌려준다.
 * 변경 요청(POST, PUT, PATCH, DELETE)은 헤더의 토큰이 쿠키와 같아야 한다.
 */
export function guard(request: Request) {
  if (!mockAccount.get().loggedIn) {
    return problem(401, '로그인이 필요합니다.', 'UNAUTHORIZED')
  }
  if (
    request.method !== 'GET' &&
    request.headers.get(CSRF_HEADER) !== MOCK_CSRF_TOKEN
  ) {
    return problem(403, 'CSRF 토큰이 없거나 맞지 않습니다.', 'CSRF_INVALID')
  }
  return null
}
