import { QueryError } from '@/components/query-error'
import { useRealtimeSubscription } from '@/features/realtime/realtime-context'
import { useRankings } from '../queries'
import { RankingCard } from './ranking-card'

/**
 * 메인의 급등락 랭킹 (F3). 처음에는 REST로 받고, 이후에는 SSE ranking 이벤트가 캐시를 바꾼다 (D12).
 */
export function RankingBoard() {
  const rankings = useRankings()
  useRealtimeSubscription({ ranking: true })

  if (rankings.isError) {
    return (
      <div className="rounded-[14px] border bg-card py-12">
        <QueryError error={rankings.error} onRetry={() => rankings.refetch()} />
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      <RankingCard kind="rising" entries={rankings.data?.rising} />
      <RankingCard kind="falling" entries={rankings.data?.falling} />
    </div>
  )
}
