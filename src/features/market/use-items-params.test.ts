import { act } from '@testing-library/react'
import { useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { renderHookWithProviders } from '@/test/render'
import { parseItemsSearch, useItemsParams } from './use-items-params'

describe('parseItemsSearch', () => {
  it('URL 쿼리를 읽는다', () => {
    expect(
      parseItemsSearch(
        new URLSearchParams('category=engraving&q=원한&sort=price-desc&page=3'),
      ),
    ).toEqual({ category: 'engraving', q: '원한', sort: 'price-desc', page: 3 })
  })

  it('모르는 값은 기본값으로 바꾼다', () => {
    expect(
      parseItemsSearch(new URLSearchParams('category=avatar&sort=x&page=-1')),
    ).toEqual({ category: 'all', q: '', sort: 'default', page: 1 })
  })
})

describe('useItemsParams', () => {
  function setup(route: string) {
    return renderHookWithProviders(
      () => ({ params: useItemsParams(), location: useLocation() }),
      { route },
    )
  }

  it('탭을 바꾸면 1페이지로 돌아가고 검색어는 유지한다', () => {
    const { result } = setup('/items?category=refining&q=파괴&page=3')
    act(() => result.current.params.setCategory('engraving'))
    expect(result.current.params).toMatchObject({
      category: 'engraving',
      q: '파괴',
      page: 1,
    })
  })

  it('기본값은 URL에 쓰지 않는다', () => {
    const { result } = setup('/items')
    act(() => result.current.params.setPage(2))
    expect(result.current.location.search).toBe('?category=all&page=2')
  })
})
