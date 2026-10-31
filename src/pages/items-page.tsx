import { Pagination } from '@/components/pagination'
import { QueryError } from '@/components/query-error'
import { StateMessage } from '@/components/state-message'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ItemTable } from '@/features/market/components/item-table'
import { ItemsToolbar } from '@/features/market/components/items-toolbar'
import {
  useCategories,
  useCollectionSummary,
  useItems,
} from '@/features/market/queries'
import { PAGE_SIZE, useItemsParams } from '@/features/market/use-items-params'
import { useNow } from '@/lib/use-now'

function Caption() {
  const { data } = useCollectionSummary()
  if (!data) return <Skeleton className="mt-2 h-4 w-72" />
  const delay =
    data.avgReflectionDelaySeconds === null
      ? ''
      : ` · 원본이 바뀌면 평균 ${data.avgReflectionDelaySeconds}초 안에 반영돼요`
  return (
    <p className="mt-1 text-sm text-muted-foreground">
      아이템 {data.collectedItemCount.toLocaleString('ko-KR')}개{delay}
    </p>
  )
}

/** 시세 목록 (/items). Figma "Items /items" */
function ItemsPage() {
  const params = useItemsParams()
  const now = useNow()
  const categories = useCategories()
  const items = useItems({
    category: params.category,
    q: params.q || undefined,
    sort: params.sort,
    page: params.page,
    size: PAGE_SIZE,
  })

  const page = items.data
  const categoryName =
    categories.data?.find((c) => c.code === params.category)?.name ?? '전체'

  let message = null
  if (items.isError) {
    message = <QueryError error={items.error} onRetry={() => items.refetch()} />
  } else if (page && page.totalElements === 0) {
    message = params.q ? (
      <StateMessage
        type="no-result"
        title={`'${params.q}' 검색 결과가 없어요`}
        action={
          <Button variant="ghost" onClick={() => params.setQuery('')}>
            검색어 지우기
          </Button>
        }
      />
    ) : (
      <StateMessage
        type="empty"
        title="아직 수집한 아이템이 없어요"
        description={`${categoryName} 시세는 수집 대상에 들어가면 여기에 나와요`}
      />
    )
  }

  const from = page ? (page.page - 1) * page.size + 1 : 0
  const to = page ? Math.min(page.page * page.size, page.totalElements) : 0

  return (
    <>
      <title>거래소 시세 · LoaPulse</title>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-[28px] leading-9 font-bold">거래소 시세</h1>
          <Caption />
        </div>

        {categories.data ? (
          <ItemsToolbar
            categories={categories.data}
            category={params.category}
            q={params.q}
            sort={params.sort}
            onCategoryChange={params.setCategory}
            onQueryChange={params.setQuery}
            onSortChange={params.setSort}
          />
        ) : (
          <Skeleton className="h-9 w-full" />
        )}

        <ItemTable
          items={page?.content}
          loading={items.isPending}
          now={now}
          message={message}
        />

        {page && page.totalElements > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {categoryName} {page.totalElements.toLocaleString('ko-KR')}개 중{' '}
              {from}–{to}
            </p>
            <Pagination
              page={page.page}
              totalPages={page.totalPages}
              onPageChange={params.setPage}
            />
          </div>
        )}

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-status-warning"
          />
          주황색 갱신 시각은 1분 넘게 새 값을 받지 못한 아이템이에요. 거래가
          뜸한 아이템은 덜 자주 수집해요.
        </p>
      </div>
    </>
  )
}

export default ItemsPage
