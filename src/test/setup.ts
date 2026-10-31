// Testing Library의 toBeInTheDocument 같은 DOM 매처를 Vitest의 expect에 붙인다
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
