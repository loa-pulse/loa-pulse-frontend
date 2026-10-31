import { describe, expect, it } from 'vitest'
import {
  formatKstDateTime,
  formatKstTime,
  formatRelativeTime,
  formatShortDate,
  secondsSince,
} from './time'

// 2026-11-01 14:32:05 KST
const NOW = new Date('2026-11-01T05:32:05Z')

describe('formatRelativeTime', () => {
  it('1분 미만은 초 단위로 보여준다', () => {
    expect(formatRelativeTime('2026-11-01T05:31:53Z', NOW)).toBe('12초 전')
    expect(formatRelativeTime('2026-11-01T05:32:05Z', NOW)).toBe('0초 전')
  })

  it('1시간 미만은 분 단위로 보여준다', () => {
    expect(formatRelativeTime('2026-11-01T05:31:05Z', NOW)).toBe('1분 전')
    expect(formatRelativeTime('2026-11-01T04:32:06Z', NOW)).toBe('59분 전')
  })

  it('1시간이 넘고 오늘(KST)이면 시각만 보여준다', () => {
    expect(formatRelativeTime('2026-11-01T01:05:00Z', NOW)).toBe('10:05')
  })

  it('오늘(KST)보다 전이면 날짜와 시각을 보여준다', () => {
    // 2026-10-31 23:50 KST (현재는 11월 1일 14:32 KST)
    expect(formatRelativeTime('2026-10-31T14:50:00Z', NOW)).toBe(
      '10월 31일 23:50',
    )
  })

  it('UTC로는 같은 날이어도 KST 날짜가 다르면 날짜를 붙인다', () => {
    // 2026-11-01 00:30 KST 현재, 2026-10-31 23:00 KST 값
    const now = new Date('2026-10-31T15:30:00Z')
    expect(formatRelativeTime('2026-10-31T14:00:00Z', now)).toBe(
      '10월 31일 23:00',
    )
  })

  it('미래 시각은 0초 전으로 본다 (서버와 시계가 조금 어긋난 경우)', () => {
    expect(formatRelativeTime('2026-11-01T05:32:10Z', NOW)).toBe('0초 전')
  })
})

describe('formatKstTime', () => {
  it('KST 시각을 보여준다', () => {
    expect(formatKstTime('2026-11-01T05:32:05Z')).toBe('14:32')
    expect(formatKstTime('2026-11-01T05:32:05Z', { withSeconds: true })).toBe(
      '14:32:05',
    )
  })

  it('자정은 00시로 보여준다', () => {
    expect(formatKstTime('2026-10-31T15:00:00Z')).toBe('00:00')
  })
})

describe('formatKstDateTime', () => {
  it('KST 날짜와 시각을 보여준다', () => {
    expect(formatKstDateTime('2026-10-31T05:32:00Z')).toBe('10월 31일 14:32')
  })
})

describe('formatShortDate', () => {
  it('API 날짜를 월/일로 보여준다', () => {
    expect(formatShortDate('2026-10-31')).toBe('10/31')
    expect(formatShortDate('2026-11-01')).toBe('11/1')
  })
})

describe('secondsSince', () => {
  it('지난 초를 정수로 돌려준다', () => {
    expect(secondsSince('2026-11-01T05:30:05Z', NOW)).toBe(120)
  })
})
