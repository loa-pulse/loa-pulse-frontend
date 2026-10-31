import { Link, useParams } from 'react-router'
import { ChevronLeftIcon } from 'lucide-react'
import { ItemThumb } from '@/components/item-thumb'
import { QueryError } from '@/components/query-error'
import { Skeleton } from '@/components/ui/skeleton'
import { DailyPriceTable } from '@/features/market/components/daily-price-table'
import { PriceCard } from '@/features/market/components/price-card'
import { PriceChartCard } from '@/features/market/components/price-chart-card'
import { itemCaption } from '@/features/market/item-display'
import { useItem } from '@/features/market/queries'
import { RealtimeIndicator } from '@/features/realtime/components/realtime-indicator'
import { useRealtimeSubscription } from '@/features/realtime/realtime-context'
import { useNow } from '@/lib/use-now'

function DetailSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-12 rounded-[10px]" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="flex gap-6">
        <div className="flex flex-1 flex-col gap-6">
          <Skeleton className="h-48 rounded-[14px]" />
          <Skeleton className="h-96 rounded-[14px]" />
        </div>
        <Skeleton className="h-80 w-[360px] rounded-[14px]" />
      </div>
    </div>
  )
}

/** 아이템 상세 (/items/:itemId). Figma "Item Detail" */
function ItemDetailPage() {
  const itemId = Number(useParams().itemId)
  const now = useNow()
  const item = useItem(itemId)
  useRealtimeSubscription({ items: item.data ? [itemId] : [] })

  return (
    <>
      <title>
        {item.data
          ? `${item.data.name} 시세 · LoaPulse`
          : '아이템 시세 · LoaPulse'}
      </title>
      <div className="flex flex-col gap-6">
        <nav
          aria-label="경로"
          className="flex items-center gap-1.5 text-[13px] text-muted-foreground"
        >
          <ChevronLeftIcon aria-hidden="true" className="size-4" />
          <Link to="/items" className="hover:text-foreground">
            시세
          </Link>
          {item.data && (
            <>
              <span aria-hidden="true">/</span>
              <Link
                to={`/items?category=${item.data.categoryCode}`}
                className="hover:text-foreground"
              >
                {item.data.categoryName}
              </Link>
            </>
          )}
        </nav>

        {item.isPending && <DetailSkeleton />}

        {item.isError && (
          <div className="rounded-[14px] border bg-card py-16">
            <QueryError
              error={item.error}
              onRetry={() => item.refetch()}
              notFoundTitle="아이템을 찾을 수 없어요"
            />
          </div>
        )}

        {item.data && (
          <>
            <div className="flex items-center gap-4">
              <ItemThumb
                name={item.data.name}
                grade={item.data.grade}
                iconUrl={item.data.iconUrl}
                size="lg"
              />
              <div className="flex flex-col gap-0.5">
                <h1 className="text-[28px] leading-9 font-bold">
                  {item.data.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {itemCaption(item.data.categoryName, item.data.bundleCount)} ·{' '}
                  {item.data.grade}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex min-w-0 flex-1 flex-col gap-6">
                <PriceCard
                  item={item.data}
                  now={now}
                  liveIndicator={
                    <RealtimeIndicator liveLabel="실시간 반영 중" />
                  }
                />
                <PriceChartCard itemId={itemId} itemName={item.data.name} />
              </div>
              <aside className="flex w-[360px] shrink-0 flex-col gap-6">
                <DailyPriceTable itemId={itemId} />
              </aside>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default ItemDetailPage
