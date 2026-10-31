import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import type { CategoryCode, ItemSort } from '@/api/schema'

export const CATEGORY_CODES: CategoryCode[] = [
  'all',
  'refining',
  'refining-extra',
  'engraving',
  'battle',
  'life',
  'cooking',
  'etc',
]

export const ITEM_SORTS: { value: ItemSort; label: string }[] = [
  { value: 'default', label: '기본 순서' },
  { value: 'change-desc', label: '전일 대비 높은 순' },
  { value: 'change-asc', label: '전일 대비 낮은 순' },
  { value: 'change1h-desc', label: '1시간 변동 높은 순' },
  { value: 'change1h-asc', label: '1시간 변동 낮은 순' },
  { value: 'price-desc', label: '가격 높은 순' },
  { value: 'price-asc', label: '가격 낮은 순' },
]

export const PAGE_SIZE = 10

export type ItemsSearch = {
  category: CategoryCode
  q: string
  sort: ItemSort
  page: number
}

/** URL 쿼리를 읽는다. 모르는 값은 기본값으로 바꿔서 화면이 깨지지 않게 한다 */
export function parseItemsSearch(params: URLSearchParams): ItemsSearch {
  const category = params.get('category') as CategoryCode | null
  const sort = params.get('sort') as ItemSort | null
  const page = Number(params.get('page'))
  return {
    category: category && CATEGORY_CODES.includes(category) ? category : 'all',
    q: params.get('q')?.trim() ?? '',
    sort: sort && ITEM_SORTS.some((s) => s.value === sort) ? sort : 'default',
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  }
}

/**
 * 시세 목록의 탭, 검색어, 정렬, 페이지를 URL 쿼리로 관리한다.
 * 새로고침하거나 링크를 공유해도 같은 목록이 나온다. 페이지 외의 값을 바꾸면 1페이지로 돌아간다.
 */
export function useItemsParams() {
  const [params, setParams] = useSearchParams()
  const search = useMemo(() => parseItemsSearch(params), [params])

  const update = useCallback(
    (patch: Partial<ItemsSearch>) => {
      const next = { ...search, page: 1, ...patch }
      const query = new URLSearchParams()
      query.set('category', next.category)
      if (next.q) query.set('q', next.q)
      if (next.sort !== 'default') query.set('sort', next.sort)
      if (next.page > 1) query.set('page', String(next.page))
      setParams(query)
    },
    [search, setParams],
  )

  return {
    ...search,
    setCategory: (category: CategoryCode) => update({ category }),
    setQuery: (q: string) => update({ q: q.trim() }),
    setSort: (sort: ItemSort) => update({ sort }),
    setPage: (page: number) => update({ page }),
  }
}
