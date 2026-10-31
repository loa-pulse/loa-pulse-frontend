import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import '@/index.css'
import { env } from '@/lib/env'
import { queryClient } from '@/lib/query-client'
import { router } from '@/router'

/** 목업을 켜면 첫 API 요청보다 먼저 서비스 워커를 띄운다. 운영 번들에는 MSW가 들어가지 않는다 */
async function startMocking() {
  if (!env.useMock) return
  const { worker } = await import('@/mocks/browser')
  // 목업에 없는 요청(아이콘 이미지 등)은 그대로 네트워크로 보낸다
  await worker.start({ onUnhandledFrame: 'bypass' })
}

startMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools />
      </QueryClientProvider>
    </StrictMode>,
  )
})
