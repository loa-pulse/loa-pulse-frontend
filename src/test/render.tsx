import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

/** 테스트마다 새 QueryClient. 실패한 요청을 다시 시도하지 않아 오류 상태를 바로 본다 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
}

type Options = { route?: string; queryClient?: QueryClient }

function wrapperFor({ route = '/', queryClient }: Options) {
  const client = queryClient ?? createTestQueryClient()
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }
}

/** QueryClient와 라우터를 감싸서 렌더링한다 */
export function renderWithProviders(ui: ReactNode, options: Options = {}) {
  return render(ui, { wrapper: wrapperFor(options) })
}

export function renderHookWithProviders<T>(
  hook: () => T,
  options: Options = {},
) {
  return renderHook(hook, { wrapper: wrapperFor(options) })
}
