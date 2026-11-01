import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ClockIcon } from 'lucide-react'
import { ApiError } from '@/api/client'
import type { Alert } from '@/api/schema'
import { ItemThumb } from '@/components/item-thumb'
import { PriceChange } from '@/components/price-change'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDailyPrices } from '@/features/market/queries'
import { formatGold } from '@/lib/format/number'
import {
  alertFormSchema,
  defaultAlertValues,
  toAlertRequest,
  type AlertFormValues,
} from '../alert-form'
import { useCreateAlert, useUpdateAlert } from '../queries'
import { AlertFormFields } from './alert-form-fields'

/** 알림을 거는 아이템. 상세 화면에서는 등락률과 전일 평균가도 안다 */
export type AlertTarget = {
  id: number
  name: string
  grade: string
  iconUrl: string | null
  currentPrice: number | null
  changeRate?: number | null
  yesterdayAvgPrice?: number | null
}

type AlertFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: AlertTarget
  /** 수정할 알림. 없으면 새로 등록한다 */
  editing?: Alert
}

/** 목표가 알림 등록·수정 모달 (Figma "Item Detail + Alert Modal") */
export function AlertFormDialog({
  open,
  onOpenChange,
  ...props
}: AlertFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] gap-6 p-6">
        {/* 닫으면 내용이 사라지므로 열 때마다 새 값으로 시작한다 */}
        <AlertFormBody {...props} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

/**
 * 모달 본문. 연 시점의 현재가로 기본 기준가를 정한다.
 * 모달이 열린 동안 실시간 가격이 바뀌어도 입력 중인 값은 그대로 둔다.
 */
function AlertFormBody({
  item,
  editing,
  onClose,
}: Omit<AlertFormDialogProps, 'open' | 'onOpenChange'> & {
  onClose: () => void
}) {
  const create = useCreateAlert()
  const update = useUpdateAlert()
  const days = useDailyPrices(item.id)
  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: defaultAlertValues(item.currentPrice, editing),
  })
  const { setError, handleSubmit } = form

  const pending = create.isPending || update.isPending

  const onSubmit = handleSubmit((values) => {
    const body = toAlertRequest(item.id, values)
    const done = {
      onSuccess: () => {
        toast.success(editing ? '알림을 수정했어요' : '알림을 등록했어요', {
          description: `${item.name} · ${formatGold(body.threshold)} ${body.direction === 'BELOW' ? '이하' : '이상'}`,
        })
        onClose()
      },
      onError: (error: Error) => {
        if (error instanceof ApiError && error.status === 401) return // 로그인 안내가 뜬다
        if (error instanceof ApiError && error.fieldErrors) {
          for (const [field, message] of Object.entries(error.fieldErrors)) {
            setError(field as keyof AlertFormValues, { message })
          }
          return
        }
        toast.error(
          error instanceof ApiError && error.status === 409 && error.detail
            ? error.detail
            : '알림을 저장하지 못했어요. 잠시 후 다시 시도해 주세요',
        )
      },
    }
    if (editing) update.mutate({ id: editing.id, body }, done)
    else create.mutate(body, done)
  })

  return (
    <>
      <DialogHeader className="flex-row items-center gap-3">
        <ItemThumb name={item.name} grade={item.grade} iconUrl={item.iconUrl} />
        <div className="flex flex-col gap-0.5 text-left">
          <DialogTitle className="text-lg font-bold">
            {editing ? '알림 수정' : '목표가 알림'}
          </DialogTitle>
          <DialogDescription>{item.name}</DialogDescription>
        </div>
      </DialogHeader>

      <div className="flex items-center justify-between rounded-lg bg-background px-4 py-3">
        <span className="text-[13px] text-muted-foreground">현재가</span>
        <span className="flex items-center gap-2">
          <span className="text-lg font-bold tabular-nums">
            {formatGold(item.currentPrice)}
          </span>
          {item.changeRate !== undefined && (
            <PriceChange rate={item.changeRate} />
          )}
        </span>
      </div>

      <FormProvider {...form}>
        <form
          id="alert-form"
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-6"
        >
          <AlertFormFields
            currentPrice={item.currentPrice}
            yesterdayAvgPrice={item.yesterdayAvgPrice ?? null}
            days={days.data?.days}
          />
        </form>
      </FormProvider>

      <p className="flex gap-2 rounded-lg bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
        <ClockIcon aria-hidden="true" className="mt-px size-3.5 shrink-0" />
        조건을 만족하면 한 번만 보내고 '발송 완료'로 바뀌어요. 다시 받으려면 내
        알림에서 다시 켜 주세요.
      </p>

      <DialogFooter>
        <Button type="button" variant="ghost" size="lg" onClick={onClose}>
          취소
        </Button>
        <Button type="submit" form="alert-form" size="lg" disabled={pending}>
          {editing ? '저장' : '알림 등록'}
        </Button>
      </DialogFooter>
    </>
  )
}
