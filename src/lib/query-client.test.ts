import { describe, expect, it } from 'vitest'
import { ApiError } from '@/api/client'
import { shouldRetry } from './query-client'

describe('shouldRetry', () => {
  it('네트워크 오류와 5xx는 두 번까지 다시 시도한다', () => {
    const network = new ApiError({ status: 0 })
    const server = new ApiError({ status: 503 })
    expect(shouldRetry(0, network)).toBe(true)
    expect(shouldRetry(1, server)).toBe(true)
    expect(shouldRetry(2, server)).toBe(false)
  })

  it('4xx는 다시 시도하지 않는다', () => {
    expect(shouldRetry(0, new ApiError({ status: 404 }))).toBe(false)
    expect(shouldRetry(0, new ApiError({ status: 401 }))).toBe(false)
  })

  it('API 오류가 아니면(화면 코드 오류) 다시 시도하지 않는다', () => {
    expect(shouldRetry(0, new TypeError('x'))).toBe(false)
  })
})
