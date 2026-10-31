/** 값이 없을 때 화면에 보여줄 표시 */
export const EMPTY_VALUE = '–'

const integerFormat = new Intl.NumberFormat('ko-KR', {
  maximumFractionDigits: 0,
})
const oneDecimalFormat = new Intl.NumberFormat('ko-KR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

/**
 * 골드 가격. 최저가처럼 정수면 그대로, 평균가처럼 소수가 있으면 소수 첫째 자리까지.
 * 예: 1240 → "1,240 G", 791.6 → "791.6 G"
 */
export function formatGold(price: number | null): string {
  if (price === null) return EMPTY_VALUE
  const text = Number.isInteger(price)
    ? integerFormat.format(price)
    : oneDecimalFormat.format(price)
  return `${text} G`
}

export type ChangeDirection = 'rise' | 'fall' | 'flat'

/** 소수 첫째 자리로 반올림한 값 기준으로 방향을 정한다. 표시 값이 0.0이면 보합이다 */
export function changeDirection(rate: number): ChangeDirection {
  const rounded = Math.round(rate * 10) / 10
  if (rounded > 0) return 'rise'
  if (rounded < 0) return 'fall'
  return 'flat'
}

/**
 * 등락률. 방향은 화살표와 색으로 보여주므로 절댓값만 쓴다.
 * 예: 2.01 → "2.0%", -5.9 → "5.9%", null → "–"
 */
export function formatChangeRate(rate: number | null): string {
  if (rate === null) return EMPTY_VALUE
  return `${oneDecimalFormat.format(Math.abs(rate))}%`
}

const MAN = 10_000
const EOK = 100_000_000

function compact(value: number, unit: number, suffix: string): string {
  const scaled = value / unit
  const text =
    scaled < 10
      ? (Math.round(scaled * 10) / 10).toString()
      : integerFormat.format(Math.round(scaled))
  return `${text}${suffix}`
}

/**
 * 거래량처럼 큰 수. 1만 이상은 "만", 1억 이상은 "억"으로 줄인다.
 * 예: 9800 → "9,800", 12_000 → "1.2만", 1_240_000 → "124만", 120_000_000 → "1.2억"
 */
export function formatCount(count: number | null): string {
  if (count === null) return EMPTY_VALUE
  if (count >= EOK) return compact(count, EOK, '억')
  if (count >= MAN) return compact(count, MAN, '만')
  return integerFormat.format(count)
}
