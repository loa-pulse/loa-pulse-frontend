import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ItemDetail, ItemSummary, Page } from '@/api/schema'
import { marketKeys } from '@/features/market/queries'
import { watchApi } from './api'

export const watchKeys = {
  list: ['watch-items'] as const,
}

/** 로그인했을 때만 부른다 */
export const useWatchItems = (enabled = true) =>
  useQuery({
    queryKey: watchKeys.list,
    queryFn: ({ signal }) => watchApi.list(signal),
    enabled,
  })

/** 목록과 상세 캐시의 watched를 바꾼다 */
function setWatched(
  queryClient: ReturnType<typeof useQueryClient>,
  itemId: number,
  watched: boolean,
) {
  queryClient.setQueryData<ItemDetail>(
    marketKeys.item(itemId),
    (item) => item && { ...item, watched },
  )
  queryClient.setQueriesData<Page<ItemSummary>>(
    { queryKey: [...marketKeys.all, 'items'] },
    (page) =>
      page && {
        ...page,
        content: page.content.map((row) =>
          row.id === itemId ? { ...row, watched } : row,
        ),
      },
  )
}

/**
 * 관심 등록·해제. 별이 바로 바뀌도록 먼저 캐시를 고치고(낙관적 갱신),
 * 실패하면 되돌린다. 끝나면 메인의 관심 아이템 목록을 다시 받는다.
 */
export function useToggleWatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, watched }: { itemId: number; watched: boolean }) =>
      watched ? watchApi.add(itemId) : watchApi.remove(itemId),
    onMutate: ({ itemId, watched }) => setWatched(queryClient, itemId, watched),
    onError: (_error, { itemId, watched }) =>
      setWatched(queryClient, itemId, !watched),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: watchKeys.list }),
  })
}
