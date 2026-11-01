import type { CollectionTier, TierStatus } from '@/api/schema'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatSeconds } from '@/lib/format/duration'
import { cn } from '@/lib/utils'

const tierStyles: Record<CollectionTier, { label: string; className: string }> =
  {
    HOT: { label: 'Hot', className: 'bg-price-rise-subtle text-price-rise' },
    NORMAL: {
      label: 'Normal',
      className: 'bg-status-warning-subtle text-status-warning',
    },
    COLD: { label: 'Cold', className: 'bg-price-fall-subtle text-price-fall' },
  }

/** 등급별 수집 현황 (Figma 상태 화면 왼쪽 아래) */
export function TierTable({ tiers }: { tiers: TierStatus[] }) {
  return (
    <section
      aria-labelledby="tier-table"
      className="flex flex-col gap-2 rounded-[14px] border bg-card p-5"
    >
      <h2 id="tier-table" className="text-base font-bold">
        등급별 수집 현황
      </h2>
      <p className="text-xs text-muted-foreground">
        관심 등록과 알림이 많고 자주 바뀌는 아이템일수록 더 자주 수집해요
      </p>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs font-normal">등급</TableHead>
            <TableHead className="text-right text-xs font-normal">
              아이템 수
            </TableHead>
            <TableHead className="text-right text-xs font-normal">
              수집 주기
            </TableHead>
            <TableHead className="text-right text-xs font-normal">
              평균 반영 지연
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiers.map((t) => (
            <TableRow key={t.tier} className="h-12 hover:bg-transparent">
              <TableCell>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs',
                    tierStyles[t.tier].className,
                  )}
                >
                  {tierStyles[t.tier].label}
                </span>
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {t.itemCount.toLocaleString('ko-KR')}개
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatSeconds(t.intervalSeconds)}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatSeconds(t.avgDelaySeconds)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}
