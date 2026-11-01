import { toast } from 'sonner'
import { StarIcon } from 'lucide-react'
import { ApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { useLoginPrompt } from '@/features/auth/login-prompt-context'
import { useAuth } from '@/features/auth/queries'
import { cn } from '@/lib/utils'
import { useToggleWatch } from '../queries'

type WatchToggleProps = {
  itemId: number
  itemName: string
  watched: boolean
  /** icon: 시세 목록의 별, button: 상세의 "관심 등록" 버튼 */
  variant?: 'icon' | 'button'
}

/** 관심 등록·해제 (F7). 로그인하지 않았으면 로그인 안내를 띄운다 */
export function WatchToggle({
  itemId,
  itemName,
  watched,
  variant = 'icon',
}: WatchToggleProps) {
  const { isLoggedIn } = useAuth()
  const promptLogin = useLoginPrompt()
  const toggle = useToggleWatch()

  const onClick = (event: React.MouseEvent) => {
    // 시세 목록에서는 행을 누르면 상세로 가므로 별 클릭이 행으로 퍼지지 않게 한다
    event.stopPropagation()
    if (!isLoggedIn) {
      promptLogin({
        title: '로그인하고 관심 아이템을 모아 보세요',
        description:
          '관심 등록한 아이템은 메인에서 바로 보고,\nLoaPulse가 더 자주 수집해요.',
      })
      return
    }
    toggle.mutate(
      { itemId, watched: !watched },
      {
        onError: (error) => {
          if (error instanceof ApiError && error.status === 401) return
          toast.error('관심 아이템을 바꾸지 못했어요')
        },
      },
    )
  }

  const star = (
    <StarIcon
      aria-hidden="true"
      className={cn(watched && 'fill-brand-gold text-brand-gold')}
    />
  )

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size="lg"
        aria-pressed={watched}
        onClick={onClick}
      >
        {star}
        {watched ? '관심 해제' : '관심 등록'}
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-pressed={watched}
      aria-label={`${itemName} 관심 ${watched ? '해제' : '등록'}`}
      onClick={onClick}
    >
      {star}
    </Button>
  )
}
