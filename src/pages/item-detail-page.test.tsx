import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { LoginPromptProvider } from '@/features/auth/login-prompt-provider'
import { mockAccount } from '@/mocks/data/account'
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

describe('아이템 상세의 알림', () => {
  function renderWithPrompt(route = '/items/66102007') {
    return renderWithProviders(
      <LoginPromptProvider>
        <Routes>
          <Route path="/items/:itemId" element={<ItemDetailPage />} />
        </Routes>
      </LoginPromptProvider>,
      { route },
    )
  }

  it('로그인하지 않았으면 알림 설정이 로그인 안내를 연다', async () => {
    renderWithPrompt()
    await userEvent.click(
      await screen.findByRole('button', { name: '알림 설정' }),
    )

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent(
      '로그인하면 운명의 파괴석 결정 화면으로 돌아와 알림 설정이 열려요',
    )
  })

  it('로그인했으면 이 아이템의 알림을 보여주고, 모달에서 등록하면 목록에 더한다', async () => {
    mockAccount.logIn()
    renderWithPrompt()

    const card = await screen.findByRole('region', { name: '이 아이템 알림' })
    expect(await within(card).findByText('790 G 이하')).toBeInTheDocument()

    await userEvent.click(
      within(card).getByRole('button', { name: /새 알림 추가/ }),
    )
    const dialog = await screen.findByRole('dialog', { name: '목표가 알림' })
    const input = within(dialog).getByRole('textbox', { name: '기준가' })
    await userEvent.clear(input)
    await userEvent.type(input, '700')
    await userEvent.click(
      within(dialog).getByRole('button', { name: '알림 등록' }),
    )

    expect(await within(card).findByText('700 G 이하')).toBeInTheDocument()
  })

  it('로그인하고 돌아오면(?alert=new) 모달이 열린 채로 시작한다', async () => {
    mockAccount.logIn()
    renderWithPrompt('/items/66102007?alert=new')

    expect(
      await screen.findByRole('dialog', { name: '목표가 알림' }),
    ).toBeInTheDocument()
  })
})
