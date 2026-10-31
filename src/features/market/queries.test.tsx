import { waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ApiError } from '@/api/client'
import { renderHookWithProviders } from '@/test/render'
import { useCategories, useItem, useItems, usePrices } from './queries'

describe('market 조회 훅 (MSW 목업)', () => {
  it('카테고리별 아이템 수를 받는다', async () => {
    const { result } = renderHookWithProviders(() => useCategories())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const refining = result.current.data!.find((c) => c.code === 'refining')
    expect(refining).toMatchObject({ name: '재련 재료', itemCount: 11 })
  })

  it('목록을 카테고리, 검색어, 페이지로 거른다', async () => {
    const { result } = renderHookWithProviders(() =>
      useItems({ category: 'refining', q: '파괴', page: 1, size: 3 }),
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const page = result.current.data!
    expect(page.content).toHaveLength(3)
    expect(page.content.every((i) => i.name.includes('파괴'))).toBe(true)
    expect(page.totalPages).toBe(Math.ceil(page.totalElements / 3))
  })

  it('전일 평균가가 없는 아이템은 전일 대비가 null이다', async () => {
    const { result } = renderHookWithProviders(() =>
      useItems({ category: 'refining', q: '수호석', page: 1 }),
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const item = result.current.data!.content.find((i) => i.name === '수호석')
    expect(item?.changeRate).toBeNull()
  })

  it('없는 아이템은 404 ApiError가 된다', async () => {
    const { result } = renderHookWithProviders(() => useItem(1))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(ApiError)
    expect((result.current.error as ApiError).status).toBe(404)
  })

  it('오늘 추이의 마지막 점은 현재가다', async () => {
    const { result: item } = renderHookWithProviders(() => useItem(66102007))
    const { result: prices } = renderHookWithProviders(() =>
      usePrices(66102007),
    )
    await waitFor(() => expect(prices.current.isSuccess).toBe(true))
    await waitFor(() => expect(item.current.isSuccess).toBe(true))
    expect(prices.current.data!.points.at(-1)!.price).toBe(
      item.current.data!.currentPrice,
    )
  })
})
