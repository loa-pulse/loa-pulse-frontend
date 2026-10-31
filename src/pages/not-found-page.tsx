import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

/** 없는 경로 (Figma 404) */
function NotFoundPage() {
  return (
    <section className="flex min-h-[640px] flex-col items-center justify-center gap-4 text-center">
      <title>페이지를 찾을 수 없어요 · LoaPulse</title>
      <p className="text-7xl font-semibold tracking-tight text-brand-gold">
        404
      </p>
      <h1 className="text-xl font-bold">페이지를 찾을 수 없어요</h1>
      <p className="text-sm whitespace-pre-line text-muted-foreground">
        {
          '주소가 바뀌었거나 수집 대상에서 빠진 아이템일 수 있어요.\n위 검색창에서 아이템 이름으로 다시 검색해 보세요.'
        }
      </p>
      <div className="mt-2 flex gap-2">
        <Button asChild size="lg">
          <Link to="/">메인으로</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/items">시세 목록 보기</Link>
        </Button>
      </div>
    </section>
  )
}

export default NotFoundPage
