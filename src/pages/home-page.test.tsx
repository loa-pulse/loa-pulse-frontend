import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { renderWithProviders } from '@/test/render'
import HomePage from './home-page'

describe('메인 화면', () => {
  it('상승과 하락 랭킹을 각각 순위대로 보여준다', async () => {
    renderWithProviders(<HomePage />)

    const rising = await screen.findByRole('region', { name: '급상승 TOP 10' })
    const falling = screen.getByRole('region', { name: '급하락 TOP 10' })
    const risingRows = await within(rising).findAllByRole('listitem')
    const fallingRows = within(falling).getAllByRole('listitem')

    expect(risingRows.length).toBeGreaterThan(0)
    expect(risingRows.length).toBeLessThanOrEqual(10)
    expect(fallingRows.length).toBeGreaterThan(0)
    expect(within(risingRows[0]).getByText('1')).toBeInTheDocument()
    expect(within(risingRows[0]).getByText('상승')).toBeInTheDocument()
    expect(within(fallingRows[0]).getByText('하락')).toBeInTheDocument()
  })

  it('랭킹 줄을 누르면 아이템 상세로 간다', async () => {
    renderWithProviders(<HomePage />)
    const rising = await screen.findByRole('region', { name: '급상승 TOP 10' })
    const [first] = await within(rising).findAllByRole('link')

    expect(first.getAttribute('href')).toMatch(/^\/items\/\d+$/)
  })

  it('랭킹이 비어 있으면 안내를 보여준다', async () => {
    server.use(
      http.get('*/api/rankings', () =>
        HttpResponse.json({
          rising: [],
          falling: [],
          calculatedAt: '2026-11-01T05:30:00Z',
        }),
      ),
    )
    renderWithProviders(<HomePage />)

    expect(
      await screen.findByText('최근 1시간 동안 오른 아이템이 없어요'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('최근 1시간 동안 내린 아이템이 없어요'),
    ).toBeInTheDocument()
  })

  it('랭킹을 불러오지 못하면 오류를 보여주고 다시 시도할 수 있다', async () => {
    server.use(
      http.get(
        '*/api/rankings',
        () => new HttpResponse(null, { status: 503 }),
        { once: true },
      ),
    )
    renderWithProviders(<HomePage />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '정보를 불러오지 못했어요',
    )
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(
      await screen.findByRole('region', { name: '급상승 TOP 10' }),
    ).toBeInTheDocument()
  })
})
