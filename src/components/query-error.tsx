import { Link } from 'react-router'
import { ActivityIcon, RotateCwIcon } from 'lucide-react'
import { ApiError } from '@/api/client'
import { StateMessage } from '@/components/state-message'
import { Button } from '@/components/ui/button'

type QueryErrorProps = {
  error: unknown
  onRetry: () => void
  /** 404일 때 보여줄 문구 (예: "아이템을 찾을 수 없어요") */
  notFoundTitle?: string
  className?: string
}

function messageFor(error: unknown, notFoundTitle?: string) {
  if (error instanceof ApiError) {
    if (error.status === 404 && notFoundTitle) {
      return {
        title: notFoundTitle,
        description: '주소가 바뀌었거나 수집 대상에서 빠졌을 수 있어요',
        canRetry: false,
      }
    }
    if (error.isNetworkError) {
      return {
        title: '서버에 연결할 수 없어요',
        description: '인터넷 연결을 확인한 뒤 다시 시도해 주세요',
        canRetry: true,
      }
    }
  }
  return {
    title: '정보를 불러오지 못했어요',
    description:
      '잠시 후 다시 시도해 주세요.\n문제가 계속되면 서비스 상태 페이지를 확인해 주세요',
    canRetry: true,
  }
}

/** API 조회가 실패했을 때의 안내 (Figma 아이템 상세 · 오류). 404, 네트워크, 서버 오류를 구분한다 */
export function QueryError({
  error,
  onRetry,
  notFoundTitle,
  className,
}: QueryErrorProps) {
  const message = messageFor(error, notFoundTitle)
  const status =
    error instanceof ApiError && error.status > 0 ? error.status : null

  return (
    <StateMessage
      type="error"
      title={message.title}
      description={message.description}
      className={className}
      action={
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {message.canRetry ? (
              <Button variant="outline" size="lg" onClick={onRetry}>
                <RotateCwIcon aria-hidden="true" />
                다시 시도
              </Button>
            ) : (
              <Button asChild variant="outline" size="lg">
                <Link to="/items">시세 목록 보기</Link>
              </Button>
            )}
            <Button asChild variant="ghost" size="lg">
              <Link to="/status">
                <ActivityIcon aria-hidden="true" />
                서비스 상태 보기
              </Link>
            </Button>
          </div>
          {status && (
            <p className="text-xs text-muted-foreground">오류 코드 {status}</p>
          )}
        </div>
      }
    />
  )
}
