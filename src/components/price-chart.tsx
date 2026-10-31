import { useEffect, useRef } from 'react'
import {
  AreaSeries,
  createChart,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type IPriceLine,
  type Time,
} from 'lightweight-charts'

export type ChartPoint = { time: Time; value: number }

type PriceChartProps = {
  points: ChartPoint[]
  /** 점선 기준선 (예: 전일 평균가) */
  baseline?: { price: number; title: string } | null
  /** 선 색. 상승은 빨강, 하락은 파랑 */
  tone: 'rise' | 'fall'
  /** 오늘 추이는 시각, 일별은 날짜를 눈금에 보여준다 */
  showTime: boolean
  height?: number
  ariaLabel: string
}

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}

/** 16진수 색에 투명도를 붙인다 (#f2545b, 0.28 → rgba) */
function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

const priceFormat = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 })

/**
 * 시세 선 차트 (lightweight-charts). Figma 상세 화면의 "시세 추이".
 * 차트는 한 번만 만들고, 데이터와 색은 바뀔 때만 다시 넣는다.
 */
export function PriceChart({
  points,
  baseline,
  tone,
  showTime,
  height = 260,
  ariaLabel,
}: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const baselineRef = useRef<IPriceLine | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { color: 'transparent' },
        textColor: cssVar('--price-flat') || '#a1a1a1',
        fontFamily: 'Geist Variable, sans-serif',
        // 라이선스(Apache 2.0)의 TradingView 표기 요구에 따라 기본 로고 표시를 유지한다
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: '#2a2a2a' },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      localization: {
        locale: 'ko-KR',
        priceFormatter: (price: number) => priceFormat.format(price),
      },
      handleScroll: false,
      handleScale: false,
    })
    chartRef.current = chart
    seriesRef.current = chart.addSeries(AreaSeries, {
      lineWidth: 2,
      priceLineVisible: false,
    })
    return () => {
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
      baselineRef.current = null
    }
  }, [])

  useEffect(() => {
    const chart = chartRef.current
    const series = seriesRef.current
    if (!chart || !series) return

    const color = cssVar(`--price-${tone}`) || '#f2545b'
    series.applyOptions({
      lineColor: color,
      topColor: withAlpha(color, 0.28),
      bottomColor: withAlpha(color, 0),
    })
    chart.applyOptions({
      timeScale: { timeVisible: showTime, secondsVisible: false },
    })
    series.setData(points)

    if (baselineRef.current) series.removePriceLine(baselineRef.current)
    baselineRef.current = baseline
      ? series.createPriceLine({
          price: baseline.price,
          title: baseline.title,
          color: cssVar('--price-flat') || '#a1a1a1',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
        })
      : null

    chart.timeScale().fitContent()
  }, [points, baseline, tone, showTime])

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      style={{ height }}
      className="w-full"
    />
  )
}
