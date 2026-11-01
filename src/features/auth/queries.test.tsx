import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mockAccount } from '@/mocks/data/account'
import { renderHookWithProviders } from '@/test/render'
import { safeReturnTo } from './login'
import { useAuth, useLogout } from './queries'

describe('useAuth', () => {
  it('로그인하지 않았으면 401을 오류가 아닌 로그아웃 상태로 본다', async () => {
    const { result } = renderHookWithProviders(() => useAuth())
    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.isLoggedIn).toBe(false)
    expect(result.current.me).toBeNull()
  })

  it('로그인했으면 내 정보를 준다', async () => {
    mockAccount.logIn()
    const { result } = renderHookWithProviders(() => useAuth())
    await waitFor(() => expect(result.current.isLoggedIn).toBe(true))
    expect(result.current.me?.nickname).toBe('모코코')
  })
})

describe('useLogout', () => {
  it('CSRF 토큰과 함께 로그아웃하고 로그아웃 상태가 된다', async () => {
    mockAccount.logIn()
    const { result } = renderHookWithProviders(() => ({
      auth: useAuth(),
      logout: useLogout(),
    }))
    await waitFor(() => expect(result.current.auth.isLoggedIn).toBe(true))

    await act(() => result.current.logout.mutateAsync())
    await waitFor(() => expect(result.current.auth.isLoggedIn).toBe(false))
    expect(mockAccount.get().loggedIn).toBe(false)
  })
})

describe('safeReturnTo', () => {
  it('같은 사이트 경로만 받는다', () => {
    expect(safeReturnTo('/items/1?alert=new')).toBe('/items/1?alert=new')
    expect(safeReturnTo('//evil.com')).toBe('/')
    expect(safeReturnTo('https://evil.com')).toBe('/')
    expect(safeReturnTo(null)).toBe('/')
  })
})
