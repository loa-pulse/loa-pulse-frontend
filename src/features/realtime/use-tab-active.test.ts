import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HIDDEN_DISCONNECT_MS, useTabActive } from './use-tab-active'

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  })
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('useTabActive', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    act(() => setVisibility('visible'))
    vi.useRealTimers()
  })

  it('숨겨진 지 10분이 지나면 false가 된다', () => {
    const { result } = renderHook(() => useTabActive())
    act(() => setVisibility('hidden'))

    act(() => vi.advanceTimersByTime(HIDDEN_DISCONNECT_MS - 1))
    expect(result.current).toBe(true)
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe(false)
  })

  it('10분 안에 돌아오면 계속 true이고, 다시 보이면 true로 돌아온다', () => {
    const { result } = renderHook(() => useTabActive())
    act(() => setVisibility('hidden'))
    act(() => vi.advanceTimersByTime(60_000))
    act(() => setVisibility('visible'))
    act(() => vi.advanceTimersByTime(HIDDEN_DISCONNECT_MS))
    expect(result.current).toBe(true)

    act(() => setVisibility('hidden'))
    act(() => vi.advanceTimersByTime(HIDDEN_DISCONNECT_MS))
    expect(result.current).toBe(false)
    act(() => setVisibility('visible'))
    expect(result.current).toBe(true)
  })
})
