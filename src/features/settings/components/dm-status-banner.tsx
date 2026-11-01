import { Link, useLocation } from 'react-router'
import { toast } from 'sonner'
import { TriangleAlertIcon } from 'lucide-react'
import type { DmStatus } from '@/api/schema'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/queries'
import { env } from '@/lib/env'
import { useDmTest } from '../queries'

type FailedStatus = Extract<DmStatus, 'LEFT_GUILD' | 'DM_BLOCKED'>

const messages: Record<FailedStatus, { title: string; description: string }> = {
  LEFT_GUILD: {
    title: 'LoaPulse 디스코드 서버를 나가서 DM을 보낼 수 없어요',
    description:
      '봇은 같은 서버에 있는 사람에게만 DM을 보낼 수 있어요. 서버에 다시 참여해 주세요.',
  },
  DM_BLOCKED: {
    title: '디스코드 DM을 보낼 수 없어요',
    description:
      '디스코드 설정에서 "서버 멤버가 보내는 다이렉트 메시지 허용"을 켜 주세요.',
  },
}

const isFailed = (status: DmStatus): status is FailedStatus =>
  status === 'LEFT_GUILD' || status === 'DM_BLOCKED'

/**
 * DM 실패 안내 배너 (기획 4.4 "DM 실패 대비책", Figma 설정 화면 위).
 * 로그인했고 DM이 실패하는 상태면 모든 화면 위에 띄운다. 알림은 웹 내역에는 계속 남는다.
 */
export function DmStatusBanner() {
  const { me } = useAuth()
  const { pathname } = useLocation()
  const dmTest = useDmTest()
  if (!me || !isFailed(me.dmStatus)) return null
  const message = messages[me.dmStatus]

  const retest = () =>
    dmTest.mutate(undefined, {
      onSuccess: (result) =>
        result.dmStatus === 'OK'
          ? toast.success('테스트 DM을 보냈어요. 디스코드를 확인해 주세요')
          : toast.error('아직 DM을 보낼 수 없어요'),
      onError: () => toast.error('테스트 DM을 보내지 못했어요'),
    })

  let action
  if (me.dmStatus === 'LEFT_GUILD' && env.discordInviteUrl) {
    action = (
      <Button asChild variant="outline">
        <a href={env.discordInviteUrl} target="_blank" rel="noreferrer">
          서버 다시 참여
        </a>
      </Button>
    )
  } else if (pathname === '/settings') {
    action = (
      <Button variant="outline" disabled={dmTest.isPending} onClick={retest}>
        다시 테스트
      </Button>
    )
  } else {
    action = (
      <Button asChild variant="outline">
        <Link to="/settings">설정에서 확인</Link>
      </Button>
    )
  }

  return (
    <div
      role="alert"
      className="mb-8 flex items-center gap-3 rounded-[10px] border border-status-warning/60 bg-status-warning-subtle px-5 py-3.5"
    >
      <TriangleAlertIcon
        aria-hidden="true"
        className="size-5 shrink-0 text-status-warning"
      />
      <div className="flex-1">
        <p className="text-sm font-medium">{message.title}</p>
        <p className="text-xs text-muted-foreground">{message.description}</p>
      </div>
      {action}
    </div>
  )
}
