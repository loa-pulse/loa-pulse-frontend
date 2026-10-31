import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useNow } from './use-now'

describe('useNow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-01T05:32:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('간격마다 현재 시각을 새로 준다', () => {
    const { result } = renderHook(() => useNow(5000))
    expect(result.current.toISOString()).toBe('2026-11-01T05:32:00.000Z')

    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.toISOString()).toBe('2026-11-01T05:32:05.000Z')
  })
})
