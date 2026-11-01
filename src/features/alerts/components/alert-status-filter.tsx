import type { AlertList } from '@/api/schema'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ALERT_FILTERS as FILTERS,
  parseAlertFilter,
  type AlertFilter,
} from '../alert-display'

type AlertStatusFilterProps = {
  value: AlertFilter
  counts: AlertList['counts'] | undefined
  onChange: (value: AlertFilter) => void
}

/** 상태 필터 (Figma "전체 5 · 활성 3 · 일시정지 1 · 발송 완료 1") */
export function AlertStatusFilter({
  value,
  counts,
  onChange,
}: AlertStatusFilterProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(parseAlertFilter(next))}
    >
      <TabsList aria-label="알림 상태" className="bg-transparent">
        {/* Figma처럼 고른 필터만 배경을 둔다 */}
        {FILTERS.map((f) => (
          <TabsTrigger key={f.value} value={f.value}>
            {counts ? `${f.label} ${counts[f.count]}` : f.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
