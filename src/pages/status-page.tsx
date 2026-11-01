import { ClockIcon } from 'lucide-react'
import { QueryError } from '@/components/query-error'
import { Skeleton } from '@/components/ui/skeleton'
import { GrafanaPanel } from '@/features/status/components/grafana-panel'
import { IncidentList } from '@/features/status/components/incident-list'
import { MetricCards } from '@/features/status/components/metric-cards'
import { StatusOverview } from '@/features/status/components/status-overview'
import { TierTable } from '@/features/status/components/tier-table'
import { useServiceHealth } from '@/features/status/queries'

/** 서비스 상태 (/status, F12). Figma "Status /status". 로그인 없이 본다 */
function StatusPage() {
  const health = useServiceHealth()

  return (
    <>
      <title>서비스 상태 · LoaPulse</title>
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[28px] leading-9 font-bold">서비스 상태</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              LoaPulse가 시세를 얼마나 빠르고 정확하게 모으는지 그대로 공개해요
            </p>
          </div>
          {health.data && (
            <StatusOverview
              status={health.data.serviceStatus}
              updatedAt={health.data.updatedAt}
            />
          )}
        </div>

        {health.isPending && (
          <div aria-busy="true" className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-36 rounded-[14px]" />
            ))}
          </div>
        )}

        {health.isError && (
          <div className="rounded-[14px] border bg-card py-12">
            <QueryError error={health.error} onRetry={() => health.refetch()} />
          </div>
        )}

        {health.data && (
          <>
            <MetricCards metrics={health.data.metrics} />
            <GrafanaPanel />
            <div className="grid grid-cols-2 gap-6">
              <TierTable tiers={health.data.tiers} />
              <IncidentList incidents={health.data.incidents} />
            </div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <ClockIcon aria-hidden="true" className="size-3.5" />
              측정 방법: 로스트아크 원본 값이 바뀐 시각부터 LoaPulse 화면에
              반영된 시각까지를 재요. M1 기준선은 모든 아이템을 같은 주기로
              수집했을 때의 값이에요.
            </p>
          </>
        )}
      </div>
    </>
  )
}

export default StatusPage
