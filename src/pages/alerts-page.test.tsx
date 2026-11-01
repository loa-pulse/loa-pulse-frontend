import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { Toaster } from '@/components/ui/sonner'
import { mockAccount } from '@/mocks/data/account'
import { mockAlerts } from '@/mocks/data/alerts'
import { server } from '@/mocks/server'
import { renderWithProviders } from '@/test/render'
import AlertsPage from './alerts-page'

function renderPage(route = '/alerts') {
  return renderWithProviders(
    <>
      <AlertsPage />
      <Toaster />
    </>,
    { route },
  )
}

const list = () =>
  within(screen.getByRole('region', { name: /등록한 알림/ })).getAllByRole(
    'listitem',
  )

describe('내 알림 화면', () => {
  it('로그인하지 않았으면 로그인을 안내한다', async () => {
    renderPage()
    expect(await screen.findByText('로그인이 필요해요')).toBeInTheDocument()
  })

  it('등록한 알림, 상태별 개수, 활성 사용량을 보여준다', async () => {
    mockAccount.logIn()
    renderPage()

    expect(await screen.findByText('790 G 이하')).toBeInTheDocument()
    expect(list()).toHaveLength(4)
    expect(screen.getByRole('tab', { name: '활성 2' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '발송 완료 1' })).toBeInTheDocument()
    expect(
      await screen.findByRole('progressbar', { name: '활성 알림 사용량' }),
    ).toHaveAttribute('aria-valuenow', '2')
  })

  it('상태 필터로 좁혀 본다', async () => {
    mockAccount.logIn()
    renderPage()
    await userEvent.click(
      await screen.findByRole('tab', { name: '일시정지 1' }),
    )

    await waitFor(() => expect(list()).toHaveLength(1))
    expect(within(list()[0]).getByText('30 G 이상')).toBeInTheDocument()
  })

  it('일시정지하면 상태와 개수가 함께 바뀐다', async () => {
    mockAccount.logIn()
    renderPage()
    await userEvent.click(
      await screen.findByRole('button', {
        name: '일시정지: 운명의 파괴석 결정 · 790 G 이하',
      }),
    )

    expect(await screen.findByText('알림을 일시정지했어요')).toBeInTheDocument()
    expect(
      await screen.findByRole('tab', { name: '일시정지 2' }),
    ).toBeInTheDocument()
  })

  it('발송 완료된 알림을 다시 켠다', async () => {
    mockAccount.logIn()
    renderPage()
    await userEvent.click(
      await screen.findByRole('button', {
        name: '다시 켜기: 유물 질량 증가 각인서 · 80,000 G 이하',
      }),
    )

    expect(await screen.findByText('알림을 다시 켰어요')).toBeInTheDocument()
    expect(
      await screen.findByRole('tab', { name: '활성 3' }),
    ).toBeInTheDocument()
  })

  it('수정 모달에서 기준가를 바꾼다', async () => {
    mockAccount.logIn()
    renderPage()
    await userEvent.click(
      await screen.findByRole('button', {
        name: '수정: 운명의 파괴석 결정 · 790 G 이하',
      }),
    )
    const dialog = await screen.findByRole('dialog', { name: '알림 수정' })
    const input = within(dialog).getByRole('textbox', { name: '기준가' })
    await userEvent.clear(input)
    await userEvent.type(input, '760')
    await userEvent.click(within(dialog).getByRole('button', { name: '저장' }))

    expect(await screen.findByText('760 G 이하')).toBeInTheDocument()
  })

  it('확인을 거쳐 삭제한다', async () => {
    mockAccount.logIn()
    renderPage()
    await userEvent.click(
      await screen.findByRole('button', {
        name: '삭제: 운명의 파괴석 결정 · 790 G 이하',
      }),
    )
    const dialog = await screen.findByRole('dialog', {
      name: '알림을 삭제할까요?',
    })
    await userEvent.click(within(dialog).getByRole('button', { name: '삭제' }))

    expect(await screen.findByText('알림을 삭제했어요')).toBeInTheDocument()
    await waitFor(() => expect(list()).toHaveLength(3))
    expect(mockAlerts.find(1)).toBeUndefined()
  })

  it('알림이 하나도 없으면 시세로 가는 안내를 보여준다', async () => {
    mockAccount.logIn()
    server.use(
      http.get('*/api/alerts', () =>
        HttpResponse.json({
          items: [],
          counts: { all: 0, active: 0, paused: 0, triggered: 0 },
          activeLimit: 20,
        }),
      ),
    )
    renderPage()

    expect(
      await screen.findByText('아직 등록한 알림이 없어요'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: '시세 보러 가기' }),
    ).toHaveAttribute('href', '/items')
  })

  it('받은 알림 내역과 DM 실패를 보여준다', async () => {
    mockAccount.logIn()
    renderPage()
    const history = await screen.findByRole('region', {
      name: /받은 알림 내역/,
    })

    expect(
      await within(history).findByText(
        '유물 질량 증가 각인서가 78,799 G가 됐어요',
      ),
    ).toBeInTheDocument()
    expect(
      within(history).getByText(
        '조건 105,000 G 이하 · DM 실패 → 웹으로만 표시',
      ),
    ).toHaveClass('text-status-warning')
    // 2026-10-31T05:32Z = KST 14:32
    expect(within(history).getByText('10월 31일 14:32')).toBeInTheDocument()
  })
})
