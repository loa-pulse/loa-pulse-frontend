import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import type { Alert } from '@/api/schema'
import { QueryError } from '@/components/query-error'
import { StateMessage } from '@/components/state-message'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { parseAlertFilter, type AlertFilter } from '../alert-display'
import { useAlerts } from '../queries'
import { AlertRow } from './alert-row'
import { AlertStatusFilter } from './alert-status-filter'

const EMPTY_FILTER_TITLE: Record<Exclude<AlertFilter, 'all'>, string> = {
  ACTIVE: '활성 알림이 없어요',
  PAUSED: '일시정지한 알림이 없어요',
  TRIGGERED: '발송 완료된 알림이 없어요',
}

type RegisteredAlertsProps = {
  /** 줄마다 붙일 동작 버튼 */
  renderActions?: (alert: Alert) => ReactNode
}

/** 내 알림의 "등록한 알림" (Figma 내 알림). 상태 필터는 주소(?status=)에 남긴다 */
export function RegisteredAlerts({ renderActions }: RegisteredAlertsProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = parseAlertFilter(searchParams.get('status'))
  const alerts = useAlerts(filter === 'all' ? {} : { status: filter })
  const counts = alerts.data?.counts

  const changeFilter = (next: AlertFilter) =>
    setSearchParams(next === 'all' ? {} : { status: next }, { replace: true })

  return (
    <section
      aria-labelledby="registered-alerts"
      className="flex flex-col gap-4"
    >
      <h2
        id="registered-alerts"
        className="flex items-baseline gap-2 text-lg font-bold"
      >
        등록한 알림
        {counts && (
          <span className="text-xs font-normal text-muted-foreground">
            {counts.all}개
          </span>
        )}
      </h2>

      {counts?.all !== 0 && (
        <AlertStatusFilter
          value={filter}
          counts={counts}
          onChange={changeFilter}
        />
      )}

      <div className="rounded-[14px] border bg-card">
        {alerts.isPending && (
          <div aria-busy="true" className="flex flex-col gap-2 p-4">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {alerts.isError && (
          <QueryError error={alerts.error} onRetry={() => alerts.refetch()} />
        )}

        {counts?.all === 0 && (
          <StateMessage
            type="empty"
            title="아직 등록한 알림이 없어요"
            description={
              '아이템 상세에서 [알림 설정]을 눌러 원하는 가격을 등록해 보세요.\n조건을 만족하면 디스코드 DM으로 한 번 알려 드려요'
            }
            action={
              <Button asChild variant="outline" size="lg">
                <Link to="/items">시세 보러 가기</Link>
              </Button>
            }
          />
        )}

        {filter !== 'all' &&
          counts?.all !== 0 &&
          alerts.data?.items.length === 0 && (
            <StateMessage type="empty" title={EMPTY_FILTER_TITLE[filter]} />
          )}

        {alerts.data && alerts.data.items.length > 0 && (
          <ul className="divide-y">
            {alerts.data.items.map((alert) => (
              <AlertRow
                key={alert.id}
                alert={alert}
                actions={renderActions?.(alert)}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
