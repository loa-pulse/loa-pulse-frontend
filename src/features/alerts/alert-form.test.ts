import { describe, expect, it } from 'vitest'
import type { DailyPrice } from '@/api/schema'
import {
  alertFormSchema,
  defaultAlertValues,
  quickPicks,
  thresholdHint,
  toAlertRequest,
  type AlertFormValues,
} from './alert-form'

const valid: AlertFormValues = {
  direction: 'BELOW',
  threshold: '790',
  channels: { dm: true, web: false },
}

function errorsOf(values: AlertFormValues) {
  const result = alertFormSchema.safeParse(values)
  return result.success ? [] : result.error.issues.map((i) => i.message)
}

describe('alertFormSchema', () => {
  it('올바른 값은 통과하고, 쉼표가 있는 기준가는 정수로 바꾼다', () => {
    expect(errorsOf(valid)).toEqual([])
    expect(toAlertRequest(1, { ...valid, threshold: '1,240' })).toEqual({
      itemId: 1,
      direction: 'BELOW',
      threshold: 1240,
      channels: { dm: true, web: false },
    })
  })

  it.each([
    ['', '기준가를 입력해 주세요'],
    ['12.5', '숫자만 입력해 주세요'],
    ['-3', '숫자만 입력해 주세요'],
    ['0', '1 G 이상으로 입력해 주세요'],
    ['2000000000', '기준가가 너무 커요'],
  ])('기준가 "%s"는 "%s"', (threshold, message) => {
    expect(errorsOf({ ...valid, threshold })).toContain(message)
  })

  it('받을 곳을 하나도 고르지 않으면 막는다', () => {
    expect(errorsOf({ ...valid, channels: { dm: false, web: false } })).toEqual(
      ['받을 곳을 하나 이상 골라 주세요'],
    )
  })
})

describe('defaultAlertValues', () => {
  it('새 알림은 현재가의 95%, 이하 조건, DM과 웹 모두로 시작한다', () => {
    expect(defaultAlertValues(829)).toEqual({
      direction: 'BELOW',
      threshold: '788',
      channels: { dm: true, web: true },
    })
  })
})

describe('quickPicks', () => {
  const days = [
    { low: 820, high: 900, avgPrice: 850 },
    { low: null, high: null, avgPrice: 810 },
  ] as DailyPrice[]

  it('이하 조건이면 현재가보다 낮은 값과 2주 최저가', () => {
    expect(quickPicks('BELOW', 829, 894.5, days)).toEqual([
      { label: '−5%', value: 788 },
      { label: '−10%', value: 746 },
      { label: '2주 최저가', value: 810 },
      { label: '전일 평균가', value: 895 },
    ])
  })

  it('이상 조건이면 높은 값과 2주 최고가. 값을 모르는 버튼은 뺀다', () => {
    expect(quickPicks('ABOVE', 829, null, days)).toEqual([
      { label: '+5%', value: 870 },
      { label: '+10%', value: 912 },
      { label: '2주 최고가', value: 900 },
    ])
  })
})

describe('thresholdHint', () => {
  it('현재가와의 차이를 알려준다', () => {
    expect(thresholdHint('BELOW', 140, 152)).toEqual({
      text: '현재가보다 12 G (7.9%) 낮아요',
      warning: false,
    })
  })

  it('조건을 이미 만족하면 경고한다', () => {
    expect(thresholdHint('BELOW', 160, 152)?.warning).toBe(true)
    expect(thresholdHint('ABOVE', 140, 152)?.warning).toBe(true)
    expect(thresholdHint('ABOVE', 152, 152)?.warning).toBe(true)
  })

  it('현재가나 기준가를 모르면 보여주지 않는다', () => {
    expect(thresholdHint('BELOW', 140, null)).toBeNull()
    expect(thresholdHint('BELOW', 0, 152)).toBeNull()
  })
})
