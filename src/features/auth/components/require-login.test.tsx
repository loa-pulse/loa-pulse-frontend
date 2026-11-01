import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mockAccount } from '@/mocks/data/account'
import { renderWithProviders } from '@/test/render'
import { RequireLogin } from './require-login'

function renderGuard() {
  return renderWithProviders(
    <RequireLogin description="로그인하면 등록한 알림을 볼 수 있어요">
      {(me) => <p>{me.nickname}님의 알림</p>}
    </RequireLogin>,
  )
}

describe('RequireLogin', () => {
  it('로그인하지 않았으면 그 자리에서 로그인을 안내한다', async () => {
    renderGuard()
    expect(await screen.findByText('로그인이 필요해요')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '디스코드 로그인' }),
    ).toBeInTheDocument()
  })

  it('로그인했으면 본문을 보여준다', async () => {
    mockAccount.logIn()
    renderGuard()
    expect(await screen.findByText('모코코님의 알림')).toBeInTheDocument()
  })
})
