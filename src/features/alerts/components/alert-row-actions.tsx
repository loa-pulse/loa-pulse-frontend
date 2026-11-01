import { useState } from 'react'
import { toast } from 'sonner'
import { PauseIcon, PencilIcon, PlayIcon, Trash2Icon } from 'lucide-react'
import { ApiError } from '@/api/client'
import type { Alert } from '@/api/schema'
import { Button } from '@/components/ui/button'
import { conditionText } from '../alert-display'
import { useDeleteAlert, usePauseAlert, useResumeAlert } from '../queries'
import { AlertFormDialog } from './alert-form-dialog'
import { DeleteAlertDialog } from './delete-alert-dialog'

/** 실패 안내. 409(활성 20개 초과)는 서버 문구를 그대로 쓴다. 401은 로그인 안내가 뜬다 */
function showError(error: Error, fallback: string) {
  if (error instanceof ApiError && error.status === 401) return
  toast.error(
    error instanceof ApiError && error.status === 409 && error.detail
      ? error.detail
      : fallback,
  )
}

/** 등록한 알림의 동작 (Figma 내 알림 오른쪽: 일시정지·다시 켜기, 수정, 삭제) */
export function AlertRowActions({ alert }: { alert: Alert }) {
  const pause = usePauseAlert()
  const resume = useResumeAlert()
  const remove = useDeleteAlert()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const summary = `${alert.item.name} · ${conditionText(alert.direction, alert.threshold)}`

  const toggle =
    alert.status === 'ACTIVE'
      ? {
          label: '일시정지',
          icon: <PauseIcon aria-hidden="true" />,
          run: () =>
            pause.mutate(alert.id, {
              onSuccess: () => toast.success('알림을 일시정지했어요'),
              onError: (e) => showError(e, '일시정지하지 못했어요'),
            }),
        }
      : {
          label: '다시 켜기',
          icon: <PlayIcon aria-hidden="true" className="text-status-live" />,
          run: () =>
            resume.mutate(alert.id, {
              onSuccess: () => toast.success('알림을 다시 켰어요'),
              onError: (e) => showError(e, '다시 켜지 못했어요'),
            }),
        }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`${toggle.label}: ${summary}`}
        title={toggle.label}
        disabled={pause.isPending || resume.isPending}
        onClick={toggle.run}
      >
        {toggle.icon}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`수정: ${summary}`}
        title="수정"
        onClick={() => setEditing(true)}
      >
        <PencilIcon aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`삭제: ${summary}`}
        title="삭제"
        onClick={() => setDeleting(true)}
      >
        <Trash2Icon aria-hidden="true" className="text-destructive" />
      </Button>

      <AlertFormDialog
        open={editing}
        onOpenChange={setEditing}
        item={alert.item}
        editing={alert}
      />
      <DeleteAlertDialog
        open={deleting}
        onOpenChange={setDeleting}
        summary={summary}
        pending={remove.isPending}
        onConfirm={() =>
          remove.mutate(alert.id, {
            onSuccess: () => {
              setDeleting(false)
              toast.success('알림을 삭제했어요')
            },
            onError: (e) => showError(e, '삭제하지 못했어요'),
          })
        }
      />
    </>
  )
}
