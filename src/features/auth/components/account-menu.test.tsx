import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { apiRequest } from '@/api/client'
import { mockAccount } from '@/mocks/data/account'
import { server } from '@/mocks/server'
import { createQueryClient } from '@/lib/query-client'
import { renderWithProviders } from '@/test/render'
import { LoginPromptProvider } from '../login-prompt-provider'
import { AccountMenu } from './account-menu'

function renderMenu() {
  return renderWithProviders(
    <LoginPromptProvider>
      <AccountMenu />
    </LoginPromptProvider>,
  )
}

describe('헤더 계정 영역', () => {
  it('로그인하지 않았으면 로그인 버튼을 보여주고, 누르면 사전 고지가 있는 안내를 연다', async () => {
    renderMenu()
    await userEvent.click(
      await screen.findByRole('button', { name: '디스코드 로그인' }),
    )

    const dialog = await screen.findByRole('dialog', {
      name: '디스코드로 로그인',
    })
    expect(dialog).toHaveTextContent('LoaPulse 디스코드 서버에 자동으로 참여')
    expect(dialog).toHaveTextContent('guilds.join')

    await userEvent.click(screen.getByRole('button', { name: '나중에 할게요' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('로그인했으면 닉네임 메뉴에서 로그아웃할 수 있다', async () => {
    mockAccount.logIn()
    renderMenu()

    await userEvent.click(await screen.findByRole('button', { name: /모코코/ }))
    await userEvent.click(
      await screen.findByRole('menuitem', { name: '로그아웃' }),
    )

    expect(
      await screen.findByRole('button', { name: '디스코드 로그인' }),
    ).toBeInTheDocument()
  })

  it('API가 401을 돌려주면 다시 로그인 안내를 연다', async () => {
    server.use(
      http.post('*/api/alerts', () =>
        HttpResponse.json(
          { status: 401, title: 'Unauthorized' },
          { status: 401 },
        ),
      ),
    )
    // 실제 앱과 같은 401 처리가 붙은 QueryClient
    const queryClient = createQueryClient()
    renderWithProviders(
      <LoginPromptProvider>
        <AccountMenu />
      </LoginPromptProvider>,
      { queryClient },
    )
    await queryClient
      .getMutationCache()
      .build(queryClient, {
        mutationFn: () => apiRequest('POST', '/api/alerts', { body: {} }),
      })
      .execute(undefined)
      .catch(() => {})

    expect(
      await screen.findByRole('dialog', { name: '다시 로그인해 주세요' }),
    ).toBeInTheDocument()
  })
})
