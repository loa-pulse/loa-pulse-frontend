import type { StatusMetrics } from '@/api/schema'
import { EMPTY_VALUE } from '@/lib/format/number'
import { formatSeconds } from '@/lib/format/duration'
import { cn } from '@/lib/utils'

/** 목표 (기획 4.1 Hot 반영 목표, 4.2 발송 지연 목표) */
const HOT_DELAY_TARGET_SECONDS = 30
const ALERT_DELAY_TARGET_SECONDS = 60

type Metric = {
  label: string
  value: string
  caption: string
  /** good: 목표 달성(초록), bad: 목표 미달(주황), neutral: 판단 없음 */
  tone: 'good' | 'bad' | 'neutral'
}

const meets = (value: number | null, target: number): Metric['tone'] =>
  value === null ? 'neutral' : value <= target ? 'good' : 'bad'

/** "M1 기준선 75초 대비 −68%". 기준선이 없으면 빈 문자열 */
function versusBaseline(value: number | null, baseline: number | null) {
  if (value === null || !baseline) return ''
  const change = Math.round(((value - baseline) / baseline) * 100)
  return ` · M1 기준선 ${formatSeconds(baseline)} 대비 ${change > 0 ? '+' : '−'}${Math.abs(change)}%`
}

function toMetrics(m: StatusMetrics): Metric[] {
  const efficiencyGain =
    m.callEfficiencyPercent !== null && m.callEfficiencyBaselinePercent !== null
      ? ` · M1 대비 ${m.callEfficiencyPercent >= m.callEfficiencyBaselinePercent ? '+' : '−'}${Math.abs(m.callEfficiencyPercent - m.callEfficiencyBaselinePercent)}%p`
      : ''

  return [
    {
      label: 'Hot 아이템 반영 지연 (p95)',
      value: formatSeconds(m.hotDelayP95Seconds),
      caption: `목표 ${HOT_DELAY_TARGET_SECONDS}초 이내${versusBaseline(m.hotDelayP95Seconds, m.hotDelayBaselineSeconds)}`,
      tone: meets(m.hotDelayP95Seconds, HOT_DELAY_TARGET_SECONDS),
    },
    {
      label: '호출 효율',
      value:
        m.callEfficiencyPercent === null
          ? EMPTY_VALUE
          : `${m.callEfficiencyPercent}%`,
      caption: `새 값을 받은 호출 비율${efficiencyGain}`,
      tone:
        m.callEfficiencyPercent === null
          ? 'neutral'
          : m.callEfficiencyBaselinePercent !== null &&
              m.callEfficiencyPercent < m.callEfficiencyBaselinePercent
            ? 'bad'
            : 'good',
    },
    {
      label: 'API 호출 한도 초과',
      value: `${m.rateLimitExceededCount}건`,
      caption: '최근 30일 · 한도 분당 100회',
      tone: m.rateLimitExceededCount > 0 ? 'bad' : 'neutral',
    },
    {
      label: '목표가 알림 발송 지연 (p95)',
      value: formatSeconds(m.alertDelayP95Seconds),
      caption: `목표 1분 이내 · 중복 발송 ${m.duplicateAlertCount}건`,
      tone: meets(m.alertDelayP95Seconds, ALERT_DELAY_TARGET_SECONDS),
    },
  ]
}

const captionTone: Record<Metric['tone'], string> = {
  good: 'text-status-live',
  bad: 'text-status-warning',
  neutral: 'text-muted-foreground',
}

/** 상태 화면의 핵심 지표 카드 4개 (Figma 상태 화면 위) */
export function MetricCards({ metrics }: { metrics: StatusMetrics }) {
  return (
    <dl className="grid grid-cols-4 gap-4">
      {toMetrics(metrics).map((metric) => (
        <div
          key={metric.label}
          className="flex flex-col gap-2 rounded-[14px] border bg-card p-5"
        >
          <dt className="text-xs text-muted-foreground">{metric.label}</dt>
          <dd className="text-[40px] leading-[48px] font-bold tracking-tight tabular-nums">
            {metric.value}
          </dd>
          <dd className={cn('text-xs', captionTone[metric.tone])}>
            {metric.caption}
          </dd>
        </div>
      ))}
    </dl>
  )
}
