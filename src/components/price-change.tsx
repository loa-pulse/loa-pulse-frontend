import { changeDirection, formatChangeRate } from '@/lib/format/number'
import { cn } from '@/lib/utils'

const styles = {
  rise: {
    box: 'bg-price-rise-subtle text-price-rise',
    arrow: '▲',
    label: '상승',
  },
  fall: {
    box: 'bg-price-fall-subtle text-price-fall',
    arrow: '▼',
    label: '하락',
  },
  flat: { box: 'bg-muted text-price-flat', arrow: '–', label: '변동 없음' },
} as const

type PriceChangeProps = {
  /** 변동률(%). 값이 없으면 null */
  rate: number | null
  className?: string
}

/** 등락률 배지 (Figma PriceChange). 상승은 빨강 ▲, 하락은 파랑 ▼ */
export function PriceChange({ rate, className }: PriceChangeProps) {
  const base =
    'inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium tabular-nums'

  if (rate === null) {
    return (
      <span className={cn(base, 'bg-muted text-price-flat', className)}>
        {formatChangeRate(null)}
        <span className="sr-only">변동률 없음</span>
      </span>
    )
  }

  const style = styles[changeDirection(rate)]
  return (
    <span className={cn(base, style.box, className)}>
      <span aria-hidden="true">{style.arrow}</span>
      {formatChangeRate(rate)}
      <span className="sr-only">{style.label}</span>
    </span>
  )
}
