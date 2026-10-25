import { Outlet } from 'react-router'

/** 모든 페이지가 공유하는 레이아웃 */
function App() {
  return (
    <main className="p-8">
      <Outlet />
    </main>
  )
}

export default App
