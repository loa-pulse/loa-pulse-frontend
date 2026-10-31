import { Link } from 'react-router'
import { RotateCwIcon } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { StateMessage } from '@/components/state-message'
import { Button } from '@/components/ui/button'

/**
 * 화면을 그리다 예상하지 못한 오류가 났을 때 (React Router ErrorBoundary).
 * 레이아웃까지 깨졌을 수 있으므로 헤더를 직접 그린다.
 * API 오류는 각 화면이 StateMessage로 처리하고, 여기까지 오지 않는다.
 */
function RouteErrorPage() {
  return (
    <>
      <title>문제가 생겼어요 · LoaPulse</title>
      <Header />
      <main className="mx-auto w-full max-w-[1200px] px-6 pt-10 pb-20">
        <div className="rounded-[14px] border bg-card py-16">
          <StateMessage
            type="error"
            title="화면을 보여주지 못했어요"
            description={
              '예상하지 못한 문제가 생겼어요.\n새로고침해도 계속되면 메인으로 이동해 주세요'
            }
            action={
              <div className="flex gap-2">
                <Button size="lg" onClick={() => window.location.reload()}>
                  <RotateCwIcon aria-hidden="true" />
                  새로고침
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/">메인으로</Link>
                </Button>
              </div>
            }
          />
        </div>
      </main>
    </>
  )
}

export default RouteErrorPage
