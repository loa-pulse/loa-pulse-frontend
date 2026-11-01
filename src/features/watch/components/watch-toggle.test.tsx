import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { LoginPromptProvider } from '@/features/auth/login-prompt-provider'
import { mockAccount } from '@/mocks/data/account'
import { mockWatch } from '@/mocks/data/watch'
import ItemsPage from '@/pages/items-page'
import { renderWithProviders } from '@/test/render'

function renderList() {
  return renderWithProviders(
    <LoginPromptProvider>
      <ItemsPage />
    </LoginPromptProvider>,
    { route: '/items?category=refining' },
  )
}

describe('관심 별', () => {
  it('로그인하지 않았으면 로그인 안내를 연다', async () => {
    renderList()
    await userEvent.click(
      await screen.findByRole('button', { name: '파괴석 관심 등록' }),
    )
    expect(
      await screen.findByRole('dialog', {
        name: '로그인하고 관심 아이템을 모아 보세요',
      }),
    ).toBeInTheDocument()
  })

  it('로그인했으면 누를 때마다 등록과 해제가 바뀐다', async () => {
    mockAccount.logIn()
    renderList()

    // 예시 관심 아이템(운명의 파괴석 결정)은 이미 별이 켜져 있다
    expect(
      await screen.findByRole('button', {
        name: '운명의 파괴석 결정 관심 해제',
      }),
    ).toHaveAttribute('aria-pressed', 'true')

    const star = screen.getByRole('button', { name: '파괴석 관심 등록' })
    await userEvent.click(star)
    expect(
      await screen.findByRole('button', { name: '파괴석 관심 해제' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(mockWatch.has(66102002)).toBe(true)

    await userEvent.click(
      screen.getByRole('button', { name: '파괴석 관심 해제' }),
    )
    expect(
      await screen.findByRole('button', { name: '파괴석 관심 등록' }),
    ).toBeInTheDocument()
    expect(mockWatch.has(66102002)).toBe(false)
  })
})
