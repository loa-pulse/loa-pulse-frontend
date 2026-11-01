import { env } from '@/lib/env'
import { CSRF_HEADER, needsCsrf, readCsrfToken } from './csrf'

/** RFC 9457 ProblemDetail + 프론트엔드가 분기할 `code` (05-api.md "오류") */
export type ProblemDetail = {
  type?: string
  title?: string
  status: number
  detail?: string
  code?: string
  /** 400 검증 실패일 때 필드별 사유 */
  errors?: Record<string, string>
}

/** API 오류. status 0은 서버에 닿지 못한 네트워크 오류다 */
export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly detail?: string
  readonly fieldErrors?: Record<string, string>

  constructor(problem: ProblemDetail) {
    super(problem.detail ?? problem.title ?? `HTTP ${problem.status}`)
    this.name = 'ApiError'
    this.status = problem.status
    this.code = problem.code
    this.detail = problem.detail
    this.fieldErrors = problem.errors
  }

  get isNetworkError() {
    return this.status === 0
  }

  get isServerError() {
    return this.status >= 500
  }
}

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>

type RequestOptions = {
  query?: QueryParams
  body?: unknown
  signal?: AbortSignal
}

/** 기본 주소가 비어 있으면 같은 출처를 쓴다 (로컬은 Vite 프록시, 목업은 MSW) */
export function apiUrl(path: string, query?: QueryParams): URL {
  const url = new URL(`${env.apiBaseUrl}${path}`, window.location.href)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === null || value === undefined || value === '') continue
    url.searchParams.set(key, String(value))
  }
  return url
}

async function toApiError(response: Response): Promise<ApiError> {
  const isJson = response.headers.get('content-type')?.includes('json')
  if (isJson) {
    try {
      const problem = (await response.json()) as Partial<ProblemDetail>
      return new ApiError({ ...problem, status: response.status })
    } catch {
      // 본문이 JSON이 아니면 상태 코드만으로 만든다
    }
  }
  return new ApiError({ status: response.status, title: response.statusText })
}

export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  { query, body, signal }: RequestOptions = {},
): Promise<T> {
  const csrfToken = needsCsrf(method) ? readCsrfToken() : null
  let response: Response
  try {
    response = await fetch(apiUrl(path, query), {
      method,
      signal,
      // 세션 쿠키를 api.{도메인}으로 보낸다 (D28)
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(csrfToken && { [CSRF_HEADER]: csrfToken }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new ApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      detail: '서버에 연결할 수 없어요',
    })
  }

  if (!response.ok) throw await toApiError(response)
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export function apiGet<T>(
  path: string,
  query?: QueryParams,
  signal?: AbortSignal,
): Promise<T> {
  return apiRequest<T>('GET', path, { query, signal })
}
