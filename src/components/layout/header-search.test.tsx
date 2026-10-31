import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { HeaderSearch } from './header-search'

function CurrentLocation() {
  const location = useLocation()
  return <p data-testid="location">{location.pathname + location.search}</p>
}

function renderSearch() {
  render(
    <MemoryRouter initialEntries={['/']}>
      <HeaderSearch />
      <Routes>
        <Route path="*" element={<CurrentLocation />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('HeaderSearch', () => {
  it('Enter를 누르면 전체 카테고리에서 검색한다', async () => {
    renderSearch()
    await userEvent.type(screen.getByRole('searchbox'), '  파괴석 {Enter}')
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/items?category=all&q=%ED%8C%8C%EA%B4%B4%EC%84%9D',
    )
  })

  it('빈 검색어는 이동하지 않는다', async () => {
    renderSearch()
    await userEvent.type(screen.getByRole('searchbox'), '   {Enter}')
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
  })
})
