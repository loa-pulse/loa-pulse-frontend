import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Toaster } from '@/components/ui/sonner'
import { mockAccount } from '@/mocks/data/account'
import { mockAlerts } from '@/mocks/data/alerts'
import { renderWithProviders } from '@/test/render'
import { AlertFormDialog, type AlertTarget } from './alert-form-dialog'

const item: AlertTarget = {
  id: 66102007,
  name: '운명의 파괴석 결정',
  grade: '일반',
  iconUrl: null,
  currentPrice: 829,
  changeRate: -7.32,
  yesterdayAvgPrice: 894.5,
}

function renderDialog(
  props: Partial<Parameters<typeof AlertFormDialog>[0]> = {},
) {
  const onOpenChange = vi.fn()
  renderWithProviders(
    <>
      <AlertFormDialog
        open
        onOpenChange={onOpenChange}
        item={item}
        {...props}
      />
      <Toaster />
    </>,
  )
  return { onOpenChange }
}

const thresholdInput = () => screen.getByRole('textbox', { name: '기준가' })

describe('알림 설정 모달', () => {
  it('현재가의 95%로 시작하고 현재가 대비 안내를 보여준다', async () => {
    renderDialog()
    expect(thresholdInput()).toHaveValue('788')
    expect(
      screen.getByText(/현재가보다 41 G \(4\.9%\) 낮아요/),
    ).toBeInTheDocument()
  })

  it('빠른 선택 버튼으로 기준가를 채운다', async () => {
    renderDialog()
    await userEvent.click(screen.getByRole('button', { name: '−10%' }))
    expect(thresholdInput()).toHaveValue('746')
  })

  it('입력이 틀리면 등록하지 않고 이유를 보여준다', async () => {
    mockAccount.logIn()
    const { onOpenChange } = renderDialog()
    await userEvent.clear(thresholdInput())
    await userEvent.click(screen.getByRole('checkbox', { name: /디스코드 DM/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: /웹 알림/ }))
    await userEvent.click(screen.getByRole('button', { name: '알림 등록' }))

    expect(
      await screen.findByText('기준가를 입력해 주세요'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('받을 곳을 하나 이상 골라 주세요'),
    ).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('등록하면 토스트를 보여주고 모달을 닫는다', async () => {
    mockAccount.logIn()
    const { onOpenChange } = renderDialog()
    await userEvent.click(screen.getByRole('radio', { name: '이상이 되면' }))
    await userEvent.clear(thresholdInput())
    await userEvent.type(thresholdInput(), '1,000')
    await userEvent.click(screen.getByRole('button', { name: '알림 등록' }))

    expect(await screen.findByText('알림을 등록했어요')).toBeInTheDocument()
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(mockAlerts.list({}).items[0]).toMatchObject({
      direction: 'ABOVE',
      threshold: 1000,
      status: 'ACTIVE',
    })
  })

  it('활성 알림이 20개면 서버의 안내를 토스트로 보여준다', async () => {
    mockAccount.logIn()
    // 예시 알림 중 활성 2개에 18개를 더한다
    for (let i = 0; i < 18; i++) {
      mockAlerts.create({
        itemId: item.id,
        direction: 'BELOW',
        threshold: 100 + i,
        channels: { dm: true, web: false },
      })
    }
    const { onOpenChange } = renderDialog()
    await userEvent.click(screen.getByRole('button', { name: '알림 등록' }))

    expect(
      await screen.findByText('활성 알림은 20개까지 등록할 수 있습니다.'),
    ).toBeInTheDocument()
    await waitFor(() => expect(onOpenChange).not.toHaveBeenCalled())
  })

  it('수정할 때는 기존 값으로 시작한다', async () => {
    mockAccount.logIn()
    const editing = mockAlerts.list({}).items[0]
    renderDialog({ editing })
    expect(
      screen.getByRole('heading', { name: '알림 수정' }),
    ).toBeInTheDocument()
    expect(thresholdInput()).toHaveValue(String(editing.threshold))
  })
})
