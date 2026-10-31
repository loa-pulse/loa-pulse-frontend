import { Skeleton } from '@/components/ui/skeleton'
import { formatCount, formatGold } from '@/lib/format/number'
import { formatShortDate } from '@/lib/format/time'
import { useDailyPrices } from '../queries'

const SHOWN_DAYS = 7

/** 최근 일별 시세 (Figma Card/Daily). 차트의 2주 탭과 같은 데이터를 최근 날짜부터 보여준다 */
export function DailyPriceTable({ itemId }: { itemId: number }) {
  const { data, isPending, isError } = useDailyPrices(itemId)
  const days = data?.days.slice(-SHOWN_DAYS).reverse() ?? []

  return (
    <section
      aria-label="최근 일별 시세"
      className="flex flex-col gap-2 rounded-[14px] border bg-card p-6"
    >
      <h2 className="text-base font-bold">최근 일별 시세</h2>
      {isError && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          일별 시세를 불러오지 못했어요
        </p>
      )}
      {!isError && (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground">
              <th className="py-2 text-left font-normal">날짜</th>
              <th className="py-2 text-right font-normal">평균가</th>
              <th className="py-2 text-right font-normal">거래량</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {isPending &&
              Array.from({ length: SHOWN_DAYS }, (_, i) => (
                <tr key={i} className="border-t">
                  <td colSpan={3} className="py-2">
                    <Skeleton className="h-3 w-full" />
                  </td>
                </tr>
              ))}
            {days.map((d) => (
              <tr key={d.date} className="border-t">
                <td className="py-2">{formatShortDate(d.date)}</td>
                <td className="py-2 text-right">{formatGold(d.avgPrice)}</td>
                <td className="py-2 text-right">{formatCount(d.tradeCount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
