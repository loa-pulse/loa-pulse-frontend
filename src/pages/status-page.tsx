import { QueryError } from '@/components/query-error'
import { Skeleton } from '@/components/ui/skeleton'
import { MetricCards } from '@/features/status/components/metric-cards'
import { StatusOverview } from '@/features/status/components/status-overview'
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

        {health.data && <MetricCards metrics={health.data.metrics} />}
      </div>
    </>
  )
}

export default StatusPage
