import { Link } from 'react-router'
import { ActivityIcon, ChevronRightIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useCollectionSummary } from '../queries'

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xs font-medium tabular-nums">{value}</dd>
    </div>
  )
}

/**
 * 수집 신선도 띠 (Figma FreshnessStrip). 신선도를 첫 화면에서부터 보여준다 (F2 기획 의도, D30).
 * 부가 정보이므로 불러오지 못하면 띠를 숨기고 화면의 나머지는 그대로 둔다.
 */
export function FreshnessStrip() {
  const { data, isPending, isError } = useCollectionSummary()

  if (isError) return null
  if (isPending) return <Skeleton className="h-11 w-full rounded-[10px]" />

  const delay =
    data.avgReflectionDelaySeconds === null
      ? '측정 중'
      : `${data.avgReflectionDelaySeconds}초`

  return (
    <section
      aria-label="수집 현황"
      className="flex items-center gap-6 rounded-[10px] border bg-card px-5 py-3"
    >
      <ActivityIcon aria-hidden="true" className="size-4 text-status-live" />
      <dl className="flex items-center gap-6">
        <Metric label="평균 반영 지연" value={delay} />
        <Metric
          label="수집 중인 아이템"
          value={`${data.collectedItemCount.toLocaleString('ko-KR')}개`}
        />
        <Metric
          label="API 호출 여유"
          value={`${data.apiCallsRemaining} / ${data.apiCallsLimit}`}
        />
      </dl>
      <Link
        to="/status"
        className="ml-auto flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground"
      >
        서비스 상태 보기
        <ChevronRightIcon aria-hidden="true" className="size-4" />
      </Link>
    </section>
  )
}
