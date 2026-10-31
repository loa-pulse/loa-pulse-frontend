import { createBrowserRouter } from 'react-router'
import App from '@/App'
import HomePage from '@/pages/home-page'
import ItemDetailPage from '@/pages/item-detail-page'
import ItemsPage from '@/pages/items-page'
import NotFoundPage from '@/pages/not-found-page'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      { index: true, Component: HomePage },
      { path: 'items', Component: ItemsPage },
      { path: 'items/:itemId', Component: ItemDetailPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
