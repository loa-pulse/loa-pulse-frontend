import type { AlertChannels, AlertDirection } from '@/api/schema'
import { formatGold } from '@/lib/format/number'

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
