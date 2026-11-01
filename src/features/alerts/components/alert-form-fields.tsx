import { useId } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react'
import type { AlertDirection, DailyPrice } from '@/api/schema'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import {
  parseThreshold,
  quickPicks,
  thresholdHint,
  type AlertFormValues,
} from '../alert-form'

const DIRECTIONS: { value: AlertDirection; label: string }[] = [
  { value: 'BELOW', label: '이하가 되면' },
  { value: 'ABOVE', label: '이상이 되면' },
]

const CHANNELS = [
  {
    key: 'dm',
    label: '디스코드 DM',
    description: 'LoaPulse 디스코드 서버의 봇이 DM으로 보내요',
  },
  {
    key: 'web',
    label: '웹 알림',
    description: 'LoaPulse를 열어 두었다면 화면에 토스트로 보여 줘요',
  },
] as const

function FieldLabel({ children, id }: { children: string; id?: string }) {
  return (
    <p id={id} className="mb-2 text-[13px] font-medium">
      {children}
    </p>
  )
}

type AlertFormFieldsProps = {
  currentPrice: number | null
  yesterdayAvgPrice: number | null
  days: DailyPrice[] | undefined
}

/** 알림 모달의 입력 (Figma 알림 모달: 조건, 기준가, 받을 곳) */
export function AlertFormFields({
  currentPrice,
  yesterdayAvgPrice,
  days,
}: AlertFormFieldsProps) {
  const ids = { direction: useId(), threshold: useId(), hint: useId() }
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<AlertFormValues>()
  const direction = useWatch({ control, name: 'direction' })
  const threshold = useWatch({ control, name: 'threshold' })
  const hint = thresholdHint(direction, parseThreshold(threshold), currentPrice)
  const picks = quickPicks(direction, currentPrice, yesterdayAvgPrice, days)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <FieldLabel id={ids.direction}>조건</FieldLabel>
        <Controller
          control={control}
          name="direction"
          render={({ field }) => (
            <RadioGroup
              aria-labelledby={ids.direction}
              value={field.value}
              onValueChange={field.onChange}
              className="grid grid-cols-2 gap-2"
            >
              {DIRECTIONS.map((d) => (
                <label
                  key={d.value}
                  className={cn(
                    'flex h-11 cursor-pointer items-center gap-3 rounded-lg border px-4 text-sm',
                    field.value === d.value && 'border-foreground bg-muted',
                  )}
                >
                  <RadioGroupItem value={d.value} />
                  {d.label}
                </label>
              ))}
            </RadioGroup>
          )}
        />
      </div>

      <div>
        <label htmlFor={ids.threshold}>
          <FieldLabel>기준가</FieldLabel>
        </label>
        <div className="relative">
          <Input
            id={ids.threshold}
            inputMode="numeric"
            autoComplete="off"
            aria-invalid={!!errors.threshold}
            aria-describedby={ids.hint}
            className="h-11 pr-9 text-base tabular-nums"
            {...register('threshold')}
          />
          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted-foreground">
            G
          </span>
        </div>
        <p
          id={ids.hint}
          className={cn(
            'mt-2 flex min-h-4 items-center gap-1.5 text-xs text-muted-foreground',
            errors.threshold && 'text-destructive',
            !errors.threshold && hint?.warning && 'text-status-warning',
          )}
        >
          {errors.threshold?.message ??
            (hint && (
              <>
                {direction === 'BELOW' ? (
                  <TrendingDownIcon
                    aria-hidden="true"
                    className="size-3.5 text-price-fall"
                  />
                ) : (
                  <TrendingUpIcon
                    aria-hidden="true"
                    className="size-3.5 text-price-rise"
                  />
                )}
                {hint.text}
              </>
            ))}
        </p>
        {picks.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {picks.map((pick) => (
              <Button
                key={pick.label}
                type="button"
                variant="secondary"
                size="sm"
                title={`${pick.value.toLocaleString('ko-KR')} G`}
                onClick={() =>
                  setValue('threshold', String(pick.value), {
                    shouldValidate: true,
                  })
                }
              >
                {pick.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      <fieldset>
        <legend className="mb-2 text-[13px] font-medium">받을 곳</legend>
        <div className="flex flex-col gap-3">
          {CHANNELS.map((channel) => (
            <Controller
              key={channel.key}
              control={control}
              name={`channels.${channel.key}`}
              render={({ field }) => (
                <label className="flex cursor-pointer gap-3">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(!!checked)}
                    className="mt-0.5"
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{channel.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {channel.description}
                    </span>
                  </span>
                </label>
              )}
            />
          ))}
        </div>
        {errors.channels && (
          <p className="mt-2 text-xs text-destructive">
            {errors.channels.message ?? errors.channels.root?.message}
          </p>
        )}
      </fieldset>
    </div>
  )
}
