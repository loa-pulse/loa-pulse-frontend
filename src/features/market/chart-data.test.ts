import { describe, expect, it } from 'vitest'
import { dailyPoints, intradayPoints, trendTone } from './chart-data'

describe('intradayPoints', () => {
  it('UTC 시각을 KST로 보이도록 9시간 옮긴 초 단위로 바꾼다', () => {
    const [point] = intradayPoints([
      { time: '2026-10-31T15:00:00Z', price: 796 },
    ])
    // 2026-11-01 00:00 KST를 UTC 눈금으로 그린 값
    expect(point).toEqual({
      time: Date.UTC(2026, 10, 1, 0, 0) / 1000,
      value: 796,
    })
  })
})

describe('dailyPoints', () => {
  it('날짜와 일별 평균가로 점을 만든다', () => {
    expect(
      dailyPoints([
        {
          date: '2026-10-31',
          avgPrice: 791.6,
          tradeCount: 1,
          open: null,
          high: null,
          low: null,
          close: null,
        },
      ]),
    ).toEqual([{ time: { year: 2026, month: 10, day: 31 }, value: 791.6 }])
  })
})

describe('trendTone', () => {
  const at = (value: number) => ({ time: '2026-10-31', value })

  it('끝이 처음보다 낮으면 하락, 아니면 상승이다', () => {
    expect(trendTone([at(10), at(8)])).toBe('fall')
    expect(trendTone([at(10), at(10)])).toBe('rise')
    expect(trendTone([at(10)])).toBe('rise')
  })
})
