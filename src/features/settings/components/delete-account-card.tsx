import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDeleteAccount } from '../queries'

/** 설정의 "회원 탈퇴" 카드. 계정과 데이터를 바로 삭제한다 (기획 4.4, D19) */
export function DeleteAccountCard() {
  const [open, setOpen] = useState(false)
  const deleteAccount = useDeleteAccount()
  const navigate = useNavigate()

  const confirm = () =>
    deleteAccount.mutate(undefined, {
      onSuccess: () => {
        setOpen(false)
        toast.success('탈퇴했어요. 그동안 이용해 주셔서 고마워요')
        navigate('/')
      },
      onError: () =>
        toast.error('탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요'),
    })

  return (
    <section
      aria-labelledby="delete-account"
      className="flex flex-col gap-4 rounded-[14px] border border-destructive/60 bg-card p-6"
    >
      <h2 id="delete-account" className="text-base font-bold text-destructive">
        회원 탈퇴
      </h2>
      <div className="flex items-center gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-sm font-medium">계정과 데이터 삭제</p>
          <p className="text-xs text-muted-foreground">
            등록한 알림, 관심 아이템, 받은 알림 내역이 모두 바로 삭제되고 되돌릴
            수 없어요.
          </p>
        </div>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          탈퇴하기
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>정말 탈퇴할까요?</DialogTitle>
            <DialogDescription>
              등록한 알림, 관심 아이템, 받은 알림 내역이 모두 바로 삭제되고
              되돌릴 수 없어요. LoaPulse 디스코드 서버는 직접 나가 주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              disabled={deleteAccount.isPending}
              onClick={confirm}
            >
              탈퇴
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
