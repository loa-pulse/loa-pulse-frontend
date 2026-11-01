import { Link } from 'react-router'
import { toast } from 'sonner'
import { BellIcon, LogOutIcon, SettingsIcon } from 'lucide-react'
import type { Me } from '@/api/schema'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useLoginPrompt } from '../login-prompt-context'
import { useAuth, useLogout } from '../queries'

function UserMenu({ me }: { me: Me }) {
  const logout = useLogout()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-1.5">
          <Avatar size="sm" className="size-7">
            {me.avatarUrl && <AvatarImage src={me.avatarUrl} alt="" />}
            <AvatarFallback className="bg-brand-discord text-xs text-white">
              {me.nickname.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{me.nickname}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem asChild>
          <Link to="/alerts">
            <BellIcon aria-hidden="true" />내 알림
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <SettingsIcon aria-hidden="true" />
            설정
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() =>
            logout.mutate(undefined, {
              onSuccess: () => toast.success('로그아웃했어요'),
              onError: () => toast.error('로그아웃하지 못했어요'),
            })
          }
        >
          <LogOutIcon aria-hidden="true" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** 헤더 오른쪽의 계정 영역 (Figma Header). 로그인 전에는 로그인 버튼, 후에는 알림 바로가기와 사용자 메뉴 */
export function AccountMenu() {
  const { me, isPending } = useAuth()
  const promptLogin = useLoginPrompt()

  if (isPending) return <Skeleton className="h-8 w-28" />

  if (!me) {
    return (
      <Button
        className="bg-brand-discord text-white hover:bg-brand-discord/80"
        onClick={() =>
          promptLogin({
            title: '디스코드로 로그인',
            description:
              '로그인하면 목표가 알림을 등록하고\n디스코드 DM으로 받을 수 있어요.',
          })
        }
      >
        디스코드 로그인
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="icon">
        <Link to="/alerts" aria-label="내 알림">
          <BellIcon aria-hidden="true" />
        </Link>
      </Button>
      <UserMenu me={me} />
    </div>
  )
}
