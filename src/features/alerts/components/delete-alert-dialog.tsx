import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type DeleteAlertDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** "운명의 파괴석 결정 · 790 G 이하" */
  summary: string
  onConfirm: () => void
  pending: boolean
}

/** 알림 삭제 확인. 지운 알림은 되돌릴 수 없다 */
export function DeleteAlertDialog({
  open,
  onOpenChange,
  summary,
  onConfirm,
  pending,
}: DeleteAlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-[360px]">
        <DialogHeader>
          <DialogTitle>알림을 삭제할까요?</DialogTitle>
          <DialogDescription>
            {summary}
            <br />
            삭제한 알림은 되돌릴 수 없어요. 잠시 멈추려면 일시정지를 쓰세요.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button variant="destructive" disabled={pending} onClick={onConfirm}>
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
