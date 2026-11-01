import type {
  AlertChannels,
  AlertDirection,
  AlertList,
  AlertStatus,
} from '@/api/schema'
import { formatGold } from '@/lib/format/number'

/** 내 알림의 상태 필터. 주소에는 `?status=ACTIVE`처럼 남긴다 */
export type AlertFilter = 'all' | AlertStatus

export const ALERT_FILTERS: {
  value: AlertFilter
  label: string
  count: keyof AlertList['counts']
}[] = [
  { value: 'all', label: '전체', count: 'all' },
  { value: 'ACTIVE', label: '활성', count: 'active' },
  { value: 'PAUSED', label: '일시정지', count: 'paused' },
  { value: 'TRIGGERED', label: '발송 완료', count: 'triggered' },
]

export function parseAlertFilter(value: string | null): AlertFilter {
  return ALERT_FILTERS.some((f) => f.value === value)
    ? (value as AlertFilter)
    : 'all'
}

/** "140 G 이하" */
export function conditionText(direction: AlertDirection, threshold: number) {
  return `${formatGold(threshold)} ${direction === 'BELOW' ? '이하' : '이상'}`
}

/** "디스코드 DM · 웹" */
export function channelsText(channels: AlertChannels) {
  return [channels.dm && '디스코드 DM', channels.web && '웹']
    .filter(Boolean)
    .join(' · ')
}
