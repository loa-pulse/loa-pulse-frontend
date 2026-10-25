import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import '@/index.css'
import App from '@/App.tsx'
import { queryClient } from '@/lib/query-client'
import HomePage from '@/pages/home-page'

const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [{ index: true, Component: HomePage }],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools />
    </QueryClientProvider>
  </StrictMode>,
)
