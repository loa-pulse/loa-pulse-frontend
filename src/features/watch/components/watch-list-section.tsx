import { Link } from 'react-router'
import { PlusIcon, StarIcon } from 'lucide-react'
import { QueryError } from '@/components/query-error'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/queries'
import { useWatchItems } from '../queries'
import { WatchItemCard } from './watch-item-card'

function AddCard({ empty }: { empty: boolean }) {
  return (
    <li>
      <Link
        to="/items"
        className="flex h-full min-h-36 flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground"
      >
        <PlusIcon aria-hidden="true" className="size-5" />
        관심 아이템 추가
        {empty && (
          <span className="px-4 text-center text-xs">
            시세 목록에서 ☆를 눌러 추가해 보세요
          </span>
        )}
      </Link>
    </li>
  )
}

/** 메인의 "내 관심 아이템" (F7). 로그인했을 때만 보여준다 */
export function WatchListSection() {
  const { isLoggedIn } = useAuth()
  const watch = useWatchItems(isLoggedIn)
  if (!isLoggedIn) return null

  return (
    <section aria-labelledby="watch-list" className="flex flex-col gap-4">
      <h2 id="watch-list" className="flex items-center gap-2 text-xl font-bold">
        <StarIcon aria-hidden="true" className="size-5 text-brand-gold" />내
        관심 아이템
        {watch.data && (
          <span className="text-xs font-normal text-muted-foreground">
            {watch.data.length}개
          </span>
        )}
      </h2>

      {watch.isPending && (
        <div aria-busy="true" className="grid grid-cols-5 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-36 rounded-[14px]" />
          ))}
        </div>
      )}

      {watch.isError && (
        <div className="rounded-[14px] border bg-card py-8">
          <QueryError error={watch.error} onRetry={() => watch.refetch()} />
        </div>
      )}

      {watch.data && (
        <ul className="grid grid-cols-5 gap-4">
          {watch.data.map((w) => (
            <WatchItemCard key={w.item.id} watch={w} />
          ))}
          <AddCard empty={watch.data.length === 0} />
        </ul>
      )}
    </section>
  )
}
