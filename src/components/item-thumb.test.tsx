import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { gradeTone } from '@/lib/item-grade'
import { ItemThumb } from './item-thumb'

describe('gradeTone', () => {
  it('한글 등급 이름을 색 이름으로 바꾼다', () => {
    expect(gradeTone('유물')).toBe('relic')
    expect(gradeTone('에스더')).toBe('esther')
    expect(gradeTone('일반')).toBe('common')
  })

  it('모르는 등급은 일반으로 본다', () => {
    expect(gradeTone('신화')).toBe('common')
  })
})

describe('ItemThumb', () => {
  const props = {
    name: '운명의 파괴석 결정',
    grade: '희귀',
    iconUrl: 'https://cdn.example/icon.png',
  }

  it('아이콘이 있으면 이미지를 보여주고 등급 색 테두리를 두른다', () => {
    const { container } = render(<ItemThumb {...props} />)
    expect(container.querySelector('img')).toHaveAttribute('src', props.iconUrl)
    expect(container.firstChild).toHaveAttribute('data-grade', 'rare')
    expect(container.firstChild).toHaveClass('border-grade-rare/50')
  })

  it('아이콘을 불러오지 못하면 이름 첫 글자를 보여준다', () => {
    const { container } = render(<ItemThumb {...props} />)
    fireEvent.error(container.querySelector('img')!)
    expect(container.querySelector('img')).toBeNull()
    expect(container).toHaveTextContent('운')
  })

  it('아이콘 주소가 없으면 처음부터 첫 글자를 보여준다', () => {
    const { container } = render(<ItemThumb {...props} iconUrl={null} />)
    expect(container.querySelector('img')).toBeNull()
    expect(container).toHaveTextContent('운')
  })
})
