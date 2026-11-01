import { z } from 'zod'
import type {
  AlertChannels,
  AlertDirection,
  AlertRequest,
  DailyPrice,
} from '@/api/schema'
import { formatGold } from '@/lib/format/number'

/** 거래소 가격으로 나올 수 없는 큰 값은 오타로 본다 */
const MAX_THRESHOLD = 1_000_000_000

const digits = (value: string) => value.replaceAll(',', '').trim()

/**
 * 알림 폼 검증 규칙 (08-frontend-plan 3-7). 기준가는 입력 그대로(문자열) 받아
 * 쉼표를 허용하고, 제출할 때 정수로 바꾼다. 받을 곳은 하나 이상 골라야 한다.
 */
export const alertFormSchema = z.object({
  direction: z.enum(['BELOW', 'ABOVE']),
  threshold: z
    .string()
    .refine((v) => digits(v) !== '', '기준가를 입력해 주세요')
    .refine((v) => /^\d*$/.test(digits(v)), '숫자만 입력해 주세요')
    .refine((v) => Number(digits(v)) >= 1, '1 G 이상으로 입력해 주세요')
    .refine((v) => Number(digits(v)) <= MAX_THRESHOLD, '기준가가 너무 커요'),
  channels: z
    .object({ dm: z.boolean(), web: z.boolean() })
    .refine((c) => c.dm || c.web, '받을 곳을 하나 이상 골라 주세요'),
})

export type AlertFormValues = z.infer<typeof alertFormSchema>

export const parseThreshold = (value: string) => Number(digits(value))

export function toAlertRequest(
  itemId: number,
  values: AlertFormValues,
): AlertRequest {
  return {
    itemId,
    direction: values.direction,
    threshold: parseThreshold(values.threshold),
    channels: values.channels,
  }
}

export function defaultAlertValues(
  currentPrice: number | null,
  initial?: {
    direction: AlertDirection
    threshold: number
    channels: AlertChannels
  },
): AlertFormValues {
  if (initial) return { ...initial, threshold: String(initial.threshold) }
  return {
    direction: 'BELOW',
    threshold: currentPrice ? String(Math.round(currentPrice * 0.95)) : '',
    channels: { dm: true, web: true },
  }
}

export type QuickPick = { label: string; value: number }

/**
 * 기준가 빠른 선택 (Figma 알림 모달). 이하 조건이면 현재가보다 낮은 값,
 * 이상 조건이면 높은 값을 고른다. 값을 알 수 없는 버튼은 뺀다.
 */
export function quickPicks(
  direction: AlertDirection,
  currentPrice: number | null,
  yesterdayAvgPrice: number | null,
  days: DailyPrice[] = [],
): QuickPick[] {
  const below = direction === 'BELOW'
  const picks: (QuickPick | null)[] = []
  if (currentPrice) {
    picks.push(
      {
        label: below ? '−5%' : '+5%',
        value: currentPrice * (below ? 0.95 : 1.05),
      },
      {
        label: below ? '−10%' : '+10%',
        value: currentPrice * (below ? 0.9 : 1.1),
      },
    )
  }
  const prices = days.map((d) => (below ? d.low : d.high) ?? d.avgPrice)
  if (prices.length > 0) {
    picks.push({
      label: below ? '2주 최저가' : '2주 최고가',
      value: below ? Math.min(...prices) : Math.max(...prices),
    })
  }
  if (yesterdayAvgPrice) {
    picks.push({ label: '전일 평균가', value: yesterdayAvgPrice })
  }
  return picks
    .filter((p): p is QuickPick => p !== null)
    .map((p) => ({ ...p, value: Math.max(1, Math.round(p.value)) }))
}

export type ThresholdHint = { text: string; warning: boolean }

/**
 * 기준가 아래 안내 (Figma "현재가보다 12 G (7.9%) 낮아요").
 * 조건이 이미 만족된 값이면 곧바로 알림이 간다고 경고한다.
 */
export function thresholdHint(
  direction: AlertDirection,
  threshold: number,
  currentPrice: number | null,
): ThresholdHint | null {
  if (!currentPrice || !Number.isFinite(threshold) || threshold < 1) return null
  const diff = threshold - currentPrice
  if (diff === 0) {
    return {
      text: '현재가와 같아요. 곧바로 알림이 갈 수 있어요',
      warning: true,
    }
  }
  const rate = ((Math.abs(diff) / currentPrice) * 100).toFixed(1)
  const base = `현재가보다 ${formatGold(Math.abs(diff))} (${rate}%) ${diff < 0 ? '낮아요' : '높아요'}`
  const alreadyMet = direction === 'BELOW' ? diff > 0 : diff < 0
  return alreadyMet
    ? {
        text: `${base}. 조건을 이미 만족해 곧바로 알림이 갈 수 있어요`,
        warning: true,
      }
    : { text: base, warning: false }
}
