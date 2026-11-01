import type { PricePoint } from '@/api/schema'
import { cn } from '@/lib/utils'

const WIDTH = 160
const HEIGHT = 32

type SparklineProps = {
  points: PricePoint[]
  className?: string
}

/**
 * 작은 추이 선 (Figma 관심 아이템 카드). 처음보다 오르면 빨강, 내리면 파랑.
 * 값을 읽게 하려는 그림이 아니므로 스크린 리더에는 숨긴다 (카드에 현재가와 변동률이 글자로 있다).
 */
export function Sparkline({ points, className }: SparklineProps) {
  if (points.length < 2) return <div className={cn('h-8', className)} />

  const prices = points.map((p) => p.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const step = WIDTH / (points.length - 1)
  const coords = prices
    .map((price, i) => {
      const x = i * step
      // 위아래 2px 여백
      const y = HEIGHT - 2 - ((price - min) / range) * (HEIGHT - 4)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const last = prices[prices.length - 1]
  const tone =
    last > prices[0]
      ? 'text-price-rise'
      : last < prices[0]
        ? 'text-price-fall'
        : 'text-price-flat'

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className={cn('h-8 w-full', tone, className)}
    >
      <polyline
        points={coords}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  )
}
