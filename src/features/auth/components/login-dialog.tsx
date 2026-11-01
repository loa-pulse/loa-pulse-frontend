import { BellIcon, CheckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

/** 기획 4.4 "사전 고지": 로그인 버튼 아래에 서버 자동 참여와 요청 권한을 알린다 */
const NOTICES = [
  '별도 가입 없이 디스코드 계정으로 로그인해요',
  '알림을 보내기 위해 LoaPulse 디스코드 서버에 자동으로 참여해요',
  '요청 권한: 프로필 확인(identify), 서버 참여(guilds.join)',
]

export type LoginPromptOptions = {
  title?: string
  description?: string
  /** 로그인 후 돌아올 경로. 없으면 지금 화면 */
  returnTo?: string
  /** 돌아온 뒤 일어날 일 (예: "운명의 파괴석 화면으로 돌아와 알림 설정이 열려요") */
  returnHint?: string
}

type LoginDialogProps = LoginPromptOptions & {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogin: () => void
}

/** 로그인 안내 모달 (Figma "Item Detail + Login Required") */
export function LoginDialog({
  open,
  onOpenChange,
  onLogin,
  title = '로그인하고 알림을 받아 보세요',
  description = '목표가 알림은 디스코드 DM으로 보내요.\n디스코드 계정으로 로그인하면 바로 등록할 수 있어요.',
  returnHint = '로그인하면 지금 보던 화면으로 돌아와요',
}: LoginDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-w-[400px] flex-col items-center gap-0 p-6 text-center">
        <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-discord">
          <BellIcon aria-hidden="true" className="size-5 text-white" />
        </span>
        <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
        <DialogDescription className="mt-3 text-sm whitespace-pre-line">
          {description}
        </DialogDescription>

        <ul className="mt-5 flex w-full flex-col gap-2 rounded-lg bg-background p-3 text-left text-xs">
          {NOTICES.map((notice) => (
            <li key={notice} className="flex gap-2">
              <CheckIcon
                aria-hidden="true"
                className="mt-px size-3.5 shrink-0 text-status-live"
              />
              {notice}
            </li>
          ))}
        </ul>

        <Button
          size="lg"
          className="mt-4 h-10 w-full bg-brand-discord text-white hover:bg-brand-discord/80"
          onClick={onLogin}
        >
          디스코드로 로그인
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">{returnHint}</p>
        <Button
          variant="ghost"
          className="mt-3"
          onClick={() => onOpenChange(false)}
        >
          나중에 할게요
        </Button>
      </DialogContent>
    </Dialog>
  )
}
