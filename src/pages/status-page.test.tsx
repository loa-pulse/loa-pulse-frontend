import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { serviceHealth } from '@/mocks/data/status'
import { server } from '@/mocks/server'
import { renderWithProviders } from '@/test/render'
import StatusPage from './status-page'

describe('서비스 상태 화면', () => {
  it('로그인 없이 전체 상태와 핵심 지표를 보여준다', async () => {
    renderWithProviders(<StatusPage />)

    expect(await screen.findByText('모든 시스템 정상')).toBeInTheDocument()
    expect(screen.getByText('24초')).toBeInTheDocument()
    expect(
      screen.getByText('목표 30초 이내 · M1 기준선 1분 15초 대비 −68%'),
    ).toHaveClass('text-status-live')
    expect(
      screen.getByText('새 값을 받은 호출 비율 · M1 대비 +41%p'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('목표 1분 이내 · 중복 발송 0건'),
    ).toBeInTheDocument()
  })

  it('등급별 수집 현황과 최근 장애를 보여준다', async () => {
    renderWithProviders(<StatusPage />)

    const tiers = await screen.findByRole('region', {
      name: '등급별 수집 현황',
    })
    const cold = within(tiers).getByText('Cold').closest('tr')!
    expect(cold).toHaveTextContent('524개')
    expect(cold).toHaveTextContent('5분')
    expect(cold).toHaveTextContent('2분 40초')

    const incidents = screen.getByRole('region', { name: '최근 장애' })
    expect(within(incidents).getByText('최근 30일 · 3건')).toBeInTheDocument()
    expect(within(incidents).getAllByText('해결됨')).toHaveLength(3)
    expect(within(incidents).getByText(/6시간/)).toBeInTheDocument()
  })

  it('목표를 넘으면 주황으로, 장애가 없으면 안내로 보여준다', async () => {
    const base = serviceHealth(new Date())
    server.use(
      http.get('*/api/status', () =>
        HttpResponse.json({
          ...base,
          serviceStatus: 'DELAYED',
          metrics: { ...base.metrics, hotDelayP95Seconds: 45 },
          incidents: [],
        }),
      ),
    )
    renderWithProviders(<StatusPage />)

    expect(await screen.findByText('시세 수집 지연')).toBeInTheDocument()
    expect(screen.getByText(/^목표 30초 이내/)).toHaveClass(
      'text-status-warning',
    )
    expect(
      screen.getByText('최근 30일 동안 장애가 없었어요'),
    ).toBeInTheDocument()
  })
})
