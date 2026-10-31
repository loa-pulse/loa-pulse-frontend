// Testing Library의 toBeInTheDocument 같은 DOM 매처를 Vitest의 expect에 붙인다
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '@/mocks/server'

// 목업에 없는 API를 부르면 테스트가 실패하게 해서, 목업과 화면이 어긋나는 것을 잡는다
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
})

afterAll(() => server.close())
