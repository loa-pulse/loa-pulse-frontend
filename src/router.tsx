import { createBrowserRouter } from 'react-router'
import App from '@/App'
import AlertsPage from '@/pages/alerts-page'
import HomePage from '@/pages/home-page'
import ItemDetailPage from '@/pages/item-detail-page'
import ItemsPage from '@/pages/items-page'
import NotFoundPage from '@/pages/not-found-page'
import RouteErrorPage from '@/pages/route-error-page'
import SettingsPage from '@/pages/settings-page'
import StatusPage from '@/pages/status-page'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    ErrorBoundary: RouteErrorPage,
    children: [
      { index: true, Component: HomePage },
      { path: 'items', Component: ItemsPage },
      { path: 'items/:itemId', Component: ItemDetailPage },
      { path: 'alerts', Component: AlertsPage },
      { path: 'settings', Component: SettingsPage },
      { path: 'status', Component: StatusPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
