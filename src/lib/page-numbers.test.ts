import { describe, expect, it } from 'vitest'
import { pageNumbers } from './page-numbers'

describe('pageNumbers', () => {
  it('페이지가 적으면 모두 보여준다', () => {
    expect(pageNumbers(1, 3)).toEqual([1, 2, 3])
  })

  it('처음과 끝, 현재 앞뒤만 보여주고 나머지는 줄인다', () => {
    expect(pageNumbers(1, 9)).toEqual([1, 2, '…', 9])
    expect(pageNumbers(5, 9)).toEqual([1, '…', 4, 5, 6, '…', 9])
    expect(pageNumbers(9, 9)).toEqual([1, '…', 8, 9])
  })

  it('한 칸만 비면 줄이지 않고 숫자를 보여준다', () => {
    expect(pageNumbers(4, 9)).toEqual([1, 2, 3, 4, 5, '…', 9])
  })
})
