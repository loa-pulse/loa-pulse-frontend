import type { PricePoint } from '@/api/schema'
import type { ChangeDirection } from '@/lib/format/number'
import { cn } from '@/lib/utils'

const WIDTH = 160
const HEIGHT = 32

type SparklineProps = {
  points: PricePoint[]
  /** 선 색. 옆의 등락률 배지와 같은 기준(전일 대비)을 넘긴다. 없으면 처음 점과 비교한다 */
  direction?: ChangeDirection
  className?: string
}

const tones: Record<ChangeDirection, string> = {
  rise: 'text-price-rise',
  fall: 'text-price-fall',
  flat: 'text-price-flat',
}

/**
 * 작은 추이 선 (Figma 관심 아이템 카드). 오르면 빨강, 내리면 파랑.
 * 값을 읽게 하려는 그림이 아니므로 스크린 리더에는 숨긴다 (카드에 현재가와 변동률이 글자로 있다).
 */
export function Sparkline({ points, direction, className }: SparklineProps) {
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
    tones[
      direction ??
        (last > prices[0] ? 'rise' : last < prices[0] ? 'fall' : 'flat')
    ]

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
