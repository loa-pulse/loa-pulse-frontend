import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import ItemDetailPage from './item-detail-page'

// jsdom에는 캔버스가 없으므로 차트는 어떤 차트를 그리려 했는지만 남긴다
vi.mock('@/components/price-chart', () => ({
  PriceChart: ({ ariaLabel }: { ariaLabel: string }) => (
    <div role="img" aria-label={ariaLabel} />
  ),
}))

function renderDetail(itemId: number) {
  return renderWithProviders(
    <Routes>
      <Route path="/items/:itemId" element={<ItemDetailPage />} />
    </Routes>,
    { route: `/items/${itemId}` },
  )
}

describe('아이템 상세 화면', () => {
  it('가격, 묶음 단위, 전일 대비, 통계를 보여준다 (실제 응답 기반 목업)', async () => {
    renderDetail(66102007)

    expect(
      await screen.findByRole('heading', { name: '운명의 파괴석 결정' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('재련 재료 · 100개 묶음 · 일반'),
    ).toBeInTheDocument()

    const card = screen.getByRole('region', { name: '현재 시세' })
    expect(within(card).getByText('829 G')).toBeInTheDocument()
    // 829 - 894.5 = -65.5 → 하락
    expect(within(card).getByText('▼ 65.5 G 전일 대비')).toBeInTheDocument()
    expect(within(card).getByText('894.5 G')).toBeInTheDocument()
    expect(within(card).getByText(/^마지막 갱신/)).toBeInTheDocument()
  })

  it('오늘 차트에서 2주 차트로 바꿀 수 있고, 최근 일별 시세 7일을 보여준다', async () => {
    renderDetail(66102007)

    expect(
      await screen.findByRole('img', { name: /오늘 분 단위 최저가 차트/ }),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('tab', { name: '2주 · 일별' }))
    expect(
      await screen.findByRole('img', { name: /최근 2주 일별 평균가 차트/ }),
    ).toBeInTheDocument()

    const daily = screen.getByRole('region', { name: '최근 일별 시세' })
    // 머리글 1행 + 7일
    expect(within(daily).getAllByRole('row')).toHaveLength(8)
  })

  it('없는 아이템이면 안내하고 시세 목록으로 보낸다', async () => {
    renderDetail(1)

    expect(
      await screen.findByText('아이템을 찾을 수 없어요'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: '시세 목록 보기' }),
    ).toHaveAttribute('href', '/items')
  })
})
