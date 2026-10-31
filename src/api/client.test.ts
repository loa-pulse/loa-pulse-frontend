import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'
import { ApiError, apiGet, apiRequest, apiUrl } from './client'

describe('apiUrl', () => {
  it('비어 있는 쿼리 값은 빼고 붙인다', () => {
    const url = apiUrl('/api/items', {
      category: 'refining',
      q: '',
      page: 2,
      sort: undefined,
    })
    expect(url.pathname).toBe('/api/items')
    expect(url.search).toBe('?category=refining&page=2')
  })
})

describe('apiRequest', () => {
  it('JSON 응답을 돌려주고 쿠키를 함께 보낸다', async () => {
    server.use(http.get('/api/ping', () => HttpResponse.json({ ok: true })))
    // Node의 fetch는 credentials를 요청 객체에 남기지 않으므로 넘긴 옵션을 직접 본다
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    await expect(apiGet('/api/ping')).resolves.toEqual({ ok: true })
    expect(fetchSpy.mock.calls[0][1]).toMatchObject({ credentials: 'include' })
    fetchSpy.mockRestore()
  })

  it('ProblemDetail 오류를 code와 함께 ApiError로 바꾼다', async () => {
    server.use(
      http.post('/api/alerts', () =>
        HttpResponse.json(
          {
            status: 409,
            title: 'Conflict',
            detail: '활성 알림은 20개까지 등록할 수 있습니다.',
            code: 'ALERT_LIMIT_EXCEEDED',
          },
          {
            status: 409,
            headers: { 'Content-Type': 'application/problem+json' },
          },
        ),
      ),
    )
    const error = await apiRequest('POST', '/api/alerts', { body: {} }).catch(
      (e: unknown) => e,
    )
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 409,
      code: 'ALERT_LIMIT_EXCEEDED',
      message: '활성 알림은 20개까지 등록할 수 있습니다.',
    })
  })

  it('본문이 없는 서버 오류도 상태 코드로 구분한다', async () => {
    server.use(
      http.get('/api/items', () => new HttpResponse(null, { status: 503 })),
    )
    const error = (await apiGet('/api/items').catch(
      (e: unknown) => e,
    )) as ApiError
    expect(error.status).toBe(503)
    expect(error.isServerError).toBe(true)
  })

  it('서버에 닿지 못하면 네트워크 오류(status 0)로 본다', async () => {
    server.use(http.get('/api/items', () => HttpResponse.error()))
    const error = (await apiGet('/api/items').catch(
      (e: unknown) => e,
    )) as ApiError
    expect(error.isNetworkError).toBe(true)
  })

  it('204는 본문 없이 끝난다', async () => {
    server.use(
      http.delete(
        '/api/alerts/1',
        () => new HttpResponse(null, { status: 204 }),
      ),
    )
    await expect(apiRequest('DELETE', '/api/alerts/1')).resolves.toBeUndefined()
  })
})
