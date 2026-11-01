import type { ReactNode } from 'react'
import { LockIcon } from 'lucide-react'
import type { Me } from '@/api/schema'
import { StateMessage } from '@/components/state-message'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLoginPrompt } from '../login-prompt-context'
import { useAuth } from '../queries'

type RequireLoginProps = {
  /** 로그인하지 않았을 때의 안내 (예: "로그인하면 등록한 알림을 볼 수 있어요") */
  description: string
  children: (me: Me) => ReactNode
}

/**
 * 로그인이 필요한 화면(/alerts, /settings)의 본문.
 * 다른 곳으로 보내지 않고 그 자리에서 로그인을 안내한다. 로그인하면 이 화면으로 돌아온다.
 */
export function RequireLogin({ description, children }: RequireLoginProps) {
  const { me, isPending } = useAuth()
  const promptLogin = useLoginPrompt()

  if (isPending) {
    return <Skeleton aria-busy="true" className="mt-8 h-64 rounded-[14px]" />
  }

  if (!me) {
    return (
      <div className="mt-8 rounded-[14px] border bg-card">
        <StateMessage
          type="empty"
          icon={LockIcon}
          title="로그인이 필요해요"
          description={description}
          action={
            <Button
              size="lg"
              className="bg-brand-discord text-white hover:bg-brand-discord/80"
              onClick={() => promptLogin({ title: '디스코드로 로그인' })}
            >
              디스코드 로그인
            </Button>
          }
        />
      </div>
    )
  }

  return children(me)
}
