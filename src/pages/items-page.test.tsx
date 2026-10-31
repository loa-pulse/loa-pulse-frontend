import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { renderWithProviders } from '@/test/render'
import ItemsPage from './items-page'

function rows() {
  // 첫 행은 머리글이다
  return screen.getAllByRole('row').slice(1)
}

describe('시세 목록 화면', () => {
  it('목록을 불러오면 한 페이지 10개와 범위를 보여준다', async () => {
    renderWithProviders(<ItemsPage />, { route: '/items?category=refining' })

    expect(
      await screen.findByRole('link', { name: '운명의 파괴석 결정' }),
    ).toBeInTheDocument()
    expect(rows()).toHaveLength(10)
    expect(screen.getByText('재련 재료 11개 중 1–10')).toBeInTheDocument()
    expect(
      screen.getAllByText('재련 재료 · 100개 묶음').length,
    ).toBeGreaterThan(0)
  })

  it('탭을 바꾸면 그 카테고리의 아이템을 보여준다', async () => {
    renderWithProviders(<ItemsPage />, { route: '/items?category=refining' })
    await userEvent.click(await screen.findByRole('tab', { name: '각인서' }))

    expect(
      await screen.findByRole('link', { name: '유물 원한 각인서' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: '운명의 파괴석 결정' }),
    ).not.toBeInTheDocument()
  })

  it('검색 결과가 없으면 안내하고, 검색어를 지우면 다시 목록을 보여준다', async () => {
    renderWithProviders(<ItemsPage />, {
      route: '/items?category=all&q=없는아이템',
    })

    expect(
      await screen.findByText("'없는아이템' 검색 결과가 없어요"),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '검색어 지우기' }))
    expect(
      await screen.findByRole('link', { name: '운명의 파괴석 결정' }),
    ).toBeInTheDocument()
  })

  it('목록을 불러오지 못하면 오류를 보여주고 다시 시도할 수 있다', async () => {
    server.use(
      http.get('*/api/items', () => new HttpResponse(null, { status: 503 }), {
        once: true,
      }),
    )
    renderWithProviders(<ItemsPage />, { route: '/items?category=refining' })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '정보를 불러오지 못했어요',
    )
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(
      await screen.findByRole('link', { name: '운명의 파괴석 결정' }),
    ).toBeInTheDocument()
  })

  it('1분 넘게 새 값을 받지 못한 아이템은 갱신 시각을 주황색으로 보여준다', async () => {
    renderWithProviders(<ItemsPage />, { route: '/items?category=refining' })
    // 목업에서 ID가 5의 배수인 아이템은 75초 넘게 지난 값이다
    const row = (
      await screen.findByRole('link', { name: '정제된 파괴강석' })
    ).closest('tr')!
    const time = within(row).getByText(/전$/)
    expect(time.closest('td')).toHaveClass('text-status-warning')
  })
})
