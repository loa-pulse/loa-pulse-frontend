import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StateMessage } from './state-message'

describe('StateMessage', () => {
  it('오류는 기본 문구를 보여주고 낭독기에 바로 알린다', () => {
    render(<StateMessage type="error" />)
    expect(screen.getByRole('alert')).toHaveTextContent(
      '정보를 불러오지 못했어요',
    )
  })

  it('화면에 맞는 문구와 버튼으로 바꿔 쓸 수 있다', () => {
    render(
      <StateMessage
        type="empty"
        title="등록한 알림이 없어요"
        description="아이템 상세 화면에서 알림을 등록해 보세요"
        action={<button>시세 둘러보기</button>}
      />,
    )
    expect(screen.getByText('등록한 알림이 없어요')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '시세 둘러보기' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
