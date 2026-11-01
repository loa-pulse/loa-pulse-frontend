import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { Toaster } from '@/components/ui/sonner'
import { DmStatusBanner } from '@/features/settings/components/dm-status-banner'
import { mockAccount } from '@/mocks/data/account'
import { mockAlerts } from '@/mocks/data/alerts'
import { renderWithProviders } from '@/test/render'
import SettingsPage from './settings-page'

function renderPage() {
  return renderWithProviders(
    <>
      <DmStatusBanner />
      <Routes>
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/" element={<p>메인</p>} />
      </Routes>
      <Toaster />
    </>,
    { route: '/settings' },
  )
}

describe('설정 화면', () => {
  it('로그인하지 않았으면 로그인을 안내한다', async () => {
    renderPage()
    expect(await screen.findByText('로그인이 필요해요')).toBeInTheDocument()
  })

  it('계정과, 아직 테스트하지 않은 DM 수신 상태를 보여준다', async () => {
    mockAccount.logIn()
    renderPage()

    expect(await screen.findByText('모코코')).toBeInTheDocument()
    expect(
      screen.getByText(
        /LoaPulse 디스코드 서버 참여 중 · 2026년 10월 20일 가입/,
      ),
    ).toBeInTheDocument()
    expect(screen.getByText(/아직 테스트하지 않았어요/)).toBeInTheDocument()
  })

  it('DM이 막혀 있으면 배너로 알리고, 다시 테스트해 도착하면 배너를 내린다', async () => {
    mockAccount.logIn()
    mockAccount.update({
      dmStatus: 'DM_BLOCKED',
      lastDmTestAt: '2026-10-31T05:20:00Z',
    })
    renderPage()

    const banner = await screen.findByRole('alert')
    expect(banner).toHaveTextContent('디스코드 DM을 보낼 수 없어요')
    expect(
      screen.getByText('DM 차단 (서버 멤버 DM 허용 꺼짐)'),
    ).toBeInTheDocument()

    await userEvent.click(
      within(banner).getByRole('button', { name: '다시 테스트' }),
    )
    expect(
      await screen.findByText('테스트 DM을 보냈어요. 디스코드를 확인해 주세요'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('도착')).toBeInTheDocument()
  })

  it('급변동 알림을 켠다', async () => {
    mockAccount.logIn()
    renderPage()
    const toggle = await screen.findByRole('switch', { name: '급변동 알림' })
    expect(toggle).not.toBeChecked()

    await userEvent.click(toggle)
    expect(await screen.findByText('급변동 알림을 켰어요')).toBeInTheDocument()
    expect(toggle).toBeChecked()
    expect(mockAccount.get().surgeAlertSubscribed).toBe(true)
  })

  it('확인을 거쳐 탈퇴하면 데이터를 지우고 메인으로 간다', async () => {
    mockAccount.logIn()
    renderPage()
    await userEvent.click(
      await screen.findByRole('button', { name: '탈퇴하기' }),
    )
    const dialog = await screen.findByRole('dialog', {
      name: '정말 탈퇴할까요?',
    })
    await userEvent.click(within(dialog).getByRole('button', { name: '탈퇴' }))

    expect(await screen.findByText('메인')).toBeInTheDocument()
    expect(mockAccount.get().loggedIn).toBe(false)
    expect(localStorage.getItem('loapulse.mock.alerts')).toBeNull()
    // 다음 로그인은 예시 알림으로 다시 시작한다
    expect(mockAlerts.activeCount()).toBe(2)
  })
})
