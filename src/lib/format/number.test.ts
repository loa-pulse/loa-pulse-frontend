import { describe, expect, it } from 'vitest'
import {
  changeDirection,
  formatChangeRate,
  formatCount,
  formatGold,
} from './number'

describe('formatGold', () => {
  it('정수 가격은 천 단위 쉼표와 G를 붙인다', () => {
    expect(formatGold(1240)).toBe('1,240 G')
    expect(formatGold(9)).toBe('9 G')
  })

  it('소수가 있는 가격은 소수 첫째 자리까지 보여준다', () => {
    expect(formatGold(791.6)).toBe('791.6 G')
    expect(formatGold(1234.56)).toBe('1,234.6 G')
  })

  it('값이 없으면 대시를 보여준다', () => {
    expect(formatGold(null)).toBe('–')
  })
})

describe('changeDirection', () => {
  it('양수는 상승, 음수는 하락이다', () => {
    expect(changeDirection(2.01)).toBe('rise')
    expect(changeDirection(-5.9)).toBe('fall')
  })

  it('소수 첫째 자리로 반올림해 0이면 보합이다', () => {
    expect(changeDirection(0)).toBe('flat')
    expect(changeDirection(0.04)).toBe('flat')
    expect(changeDirection(-0.04)).toBe('flat')
  })
})

describe('formatChangeRate', () => {
  it('절댓값을 소수 첫째 자리까지 보여준다', () => {
    expect(formatChangeRate(2.01)).toBe('2.0%')
    expect(formatChangeRate(-5.9)).toBe('5.9%')
    expect(formatChangeRate(12.345)).toBe('12.3%')
    expect(formatChangeRate(0)).toBe('0.0%')
  })

  it('값이 없으면 대시를 보여준다', () => {
    expect(formatChangeRate(null)).toBe('–')
  })
})

describe('formatCount', () => {
  it('1만 미만은 쉼표만 붙인다', () => {
    expect(formatCount(9800)).toBe('9,800')
  })

  it('1만 이상은 만 단위로 줄인다', () => {
    expect(formatCount(12_000)).toBe('1.2만')
    expect(formatCount(1_240_000)).toBe('124만')
    expect(formatCount(10_000)).toBe('1만')
  })

  it('1억 이상은 억 단위로 줄인다', () => {
    expect(formatCount(120_000_000)).toBe('1.2억')
    expect(formatCount(1_500_000_000)).toBe('15억')
  })

  it('값이 없으면 대시를 보여준다', () => {
    expect(formatCount(null)).toBe('–')
  })
})
