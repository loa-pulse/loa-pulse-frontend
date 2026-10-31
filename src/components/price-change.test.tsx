import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PriceChange } from './price-change'

describe('PriceChange', () => {
  it('상승은 ▲와 절댓값, 낭독용 "상승"을 보여준다', () => {
    const { container } = render(<PriceChange rate={2.01} />)
    expect(container).toHaveTextContent('▲2.0%상승')
    expect(container.firstChild).toHaveClass('text-price-rise')
  })

  it('하락은 ▼와 절댓값을 파란색으로 보여준다', () => {
    const { container } = render(<PriceChange rate={-5.9} />)
    expect(container).toHaveTextContent('▼5.9%하락')
    expect(container.firstChild).toHaveClass('text-price-fall')
  })

  it('반올림해 0이면 보합으로 보여준다', () => {
    const { container } = render(<PriceChange rate={0.04} />)
    expect(container).toHaveTextContent('–0.0%변동 없음')
  })

  it('값이 없으면 대시만 보여준다', () => {
    render(<PriceChange rate={null} />)
    expect(screen.getByText('변동률 없음')).toBeInTheDocument()
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
  })
})
