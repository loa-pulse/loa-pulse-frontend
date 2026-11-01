import { EMPTY_VALUE } from './number'

/**
 * 초를 읽기 쉬운 길이로. 수집 주기와 반영 지연 표시에 쓴다.
 * 예: 24 → "24초", 60 → "1분", 160 → "2분 40초", null → "–"
 */
export function formatSeconds(seconds: number | null): string {
  if (seconds === null) return EMPTY_VALUE
  const total = Math.round(seconds)
  if (total < 60) return `${total}초`
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  return rest === 0 ? `${minutes}분` : `${minutes}분 ${rest}초`
}

/**
 * 분을 읽기 쉬운 길이로. 장애 지속 시간에 쓴다.
 * 예: 14 → "14분", 360 → "6시간", 90 → "1시간 30분"
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}분`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`
}
