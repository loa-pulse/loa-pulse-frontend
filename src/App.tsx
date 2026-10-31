import { Outlet } from 'react-router'
import { Header } from '@/components/layout/header'
import { Toaster } from '@/components/ui/sonner'
import { RealtimeIndicator } from '@/features/realtime/components/realtime-indicator'
import { ServiceStatusBanner } from '@/features/realtime/components/service-status-banner'
import { RealtimeProvider } from '@/features/realtime/realtime-provider'

/** 모든 페이지가 공유하는 레이아웃. 데스크톱 1440px 기준, 본문 폭 1200px */
function App() {
  return (
    <RealtimeProvider>
      <Header actions={<RealtimeIndicator />} />
      <ServiceStatusBanner />
      <main className="mx-auto w-full max-w-[1200px] px-6 pt-10 pb-20">
        <Outlet />
      </main>
      <Toaster />
    </RealtimeProvider>
  )
}

export default App
