import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { LogOutIcon } from 'lucide-react'
import type { Me } from '@/api/schema'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useLogout } from '@/features/auth/queries'
import { cn } from '@/lib/utils'

const joinedFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

/** 설정의 "디스코드 계정" 카드 (Figma 설정) */
export function AccountCard({ me }: { me: Me }) {
  const logout = useLogout()
  const navigate = useNavigate()

  return (
    <section
      aria-labelledby="account-card"
      className="flex flex-col gap-5 rounded-[14px] border bg-card p-6"
    >
      <h2 id="account-card" className="text-base font-bold">
        디스코드 계정
      </h2>
      <div className="flex items-center gap-4">
        <Avatar size="lg" className="size-12">
          {me.avatarUrl && <AvatarImage src={me.avatarUrl} alt="" />}
          <AvatarFallback className="bg-brand-discord text-base text-white">
            {me.nickname.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-sm font-medium">{me.nickname}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              aria-hidden="true"
              className={cn(
                'size-1.5 rounded-full',
                me.guildMember ? 'bg-status-live' : 'bg-status-warning',
              )}
            />
            {me.guildMember
              ? 'LoaPulse 디스코드 서버 참여 중'
              : 'LoaPulse 디스코드 서버에 참여하지 않았어요'}
            {' · '}
            {joinedFormat.format(new Date(me.joinedAt))} 가입
          </p>
        </div>
        <Button
          variant="outline"
          disabled={logout.isPending}
          onClick={() =>
            logout.mutate(undefined, {
              onSuccess: () => {
                toast.success('로그아웃했어요')
                navigate('/')
              },
              onError: () => toast.error('로그아웃하지 못했어요'),
            })
          }
        >
          <LogOutIcon aria-hidden="true" />
          로그아웃
        </Button>
      </div>
    </section>
  )
}
