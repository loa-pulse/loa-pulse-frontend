import { createBrowserRouter } from 'react-router'
import App from '@/App'
import RouteErrorPage from '@/pages/route-error-page'

/** 페이지는 그 경로에 처음 들어갈 때 불러온다. 차트 라이브러리처럼 큰 의존성이 첫 화면에 실리지 않는다 */
function page(load: () => Promise<{ default: React.ComponentType }>) {
  return async () => ({ Component: (await load()).default })
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    ErrorBoundary: RouteErrorPage,
    children: [
      { index: true, lazy: page(() => import('@/pages/home-page')) },
      { path: 'items', lazy: page(() => import('@/pages/items-page')) },
      {
        path: 'items/:itemId',
        lazy: page(() => import('@/pages/item-detail-page')),
      },
      { path: 'alerts', lazy: page(() => import('@/pages/alerts-page')) },
      { path: 'settings', lazy: page(() => import('@/pages/settings-page')) },
      { path: 'status', lazy: page(() => import('@/pages/status-page')) },
      { path: '*', lazy: page(() => import('@/pages/not-found-page')) },
    ],
  },
])
