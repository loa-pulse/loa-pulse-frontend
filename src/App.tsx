import { Outlet } from 'react-router'
import { Header } from '@/components/layout/header'
import { Toaster } from '@/components/ui/sonner'

/** 모든 페이지가 공유하는 레이아웃. 데스크톱 1440px 기준, 본문 폭 1200px */
function App() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1200px] px-6 pt-10 pb-20">
        <Outlet />
      </main>
      <Toaster />
    </>
  )
}

export default App
