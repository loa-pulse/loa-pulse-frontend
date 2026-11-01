import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Toaster } from '@/components/ui/sonner'
import type { NotificationEvent } from '@/features/realtime/events'
import { applyNotificationEvent } from './notification-toast'

const event: NotificationEvent = {
  notificationId: 1024,
  alertId: 31,
  item: { id: 66102007, name: '운명의 파괴석 결정', iconUrl: null },
  price: 788,
  direction: 'BELOW',
  threshold: 790,
  createdAt: '2026-11-01T05:35:26Z',
}

describe('applyNotificationEvent', () => {
  it('토스트를 띄우고 내 알림과 내 정보를 다시 받게 한다', async () => {
    render(<Toaster />)
    const queryClient = new QueryClient()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const openItem = vi.fn()

    act(() => applyNotificationEvent(queryClient, event, openItem))

    expect(
      await screen.findByText('운명의 파괴석 결정이 788 G가 됐어요'),
    ).toBeInTheDocument()
    expect(screen.getByText('조건 790 G 이하')).toBeInTheDocument()
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['alerts'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['auth', 'me'] })

    // sonner는 pointerdown에서 jsdom에 없는 setPointerCapture를 부르므로 클릭만 보낸다
    fireEvent.click(screen.getByRole('button', { name: '보기' }))
    expect(openItem).toHaveBeenCalledWith(66102007)
  })
})
