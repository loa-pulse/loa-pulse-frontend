import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/client'
import { renderWithProviders } from '@/test/render'
import { QueryError } from './query-error'

describe('QueryError', () => {
  it('서버 오류는 다시 시도 버튼과 오류 코드를 보여준다', async () => {
    const onRetry = vi.fn()
    renderWithProviders(
      <QueryError error={new ApiError({ status: 503 })} onRetry={onRetry} />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      '정보를 불러오지 못했어요',
    )
    expect(screen.getByText('오류 코드 503')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('네트워크 오류는 연결 안내를 보여준다', () => {
    renderWithProviders(
      <QueryError error={new ApiError({ status: 0 })} onRetry={() => {}} />,
    )
    expect(screen.getByText('서버에 연결할 수 없어요')).toBeInTheDocument()
    expect(screen.queryByText(/오류 코드/)).not.toBeInTheDocument()
  })

  it('404는 화면에 맞는 문구와 목록 이동을 보여준다', () => {
    renderWithProviders(
      <QueryError
        error={new ApiError({ status: 404 })}
        onRetry={() => {}}
        notFoundTitle="아이템을 찾을 수 없어요"
      />,
    )
    expect(screen.getByText('아이템을 찾을 수 없어요')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: '시세 목록 보기' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '다시 시도' }),
    ).not.toBeInTheDocument()
  })
})
