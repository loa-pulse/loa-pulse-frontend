import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react'
import type { RankingEntry } from '@/api/schema'
import { StateMessage } from '@/components/state-message'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { RankingRow } from './ranking-row'

const kinds = {
  rising: {
    title: '급상승 TOP 10',
    icon: TrendingUpIcon,
    tone: 'text-price-rise',
    empty: '최근 1시간 동안 오른 아이템이 없어요',
  },
  falling: {
    title: '급하락 TOP 10',
    icon: TrendingDownIcon,
    tone: 'text-price-fall',
    empty: '최근 1시간 동안 내린 아이템이 없어요',
  },
} as const

type RankingCardProps = {
  kind: keyof typeof kinds
  /** 불러오는 중이면 undefined */
  entries: RankingEntry[] | undefined
}

/** 상승 또는 하락 랭킹 카드 (Figma RankingList) */
export function RankingCard({ kind, entries }: RankingCardProps) {
  const { title, icon: Icon, tone, empty } = kinds[kind]

  return (
    <section
      aria-label={title}
      className="flex flex-1 flex-col gap-2 rounded-[14px] border bg-card p-4"
    >
      <h2 className={cn('flex items-center gap-2 px-3 py-1 font-bold', tone)}>
        <Icon aria-hidden="true" className="size-4" />
        {title}
      </h2>

      {entries === undefined ? (
        <div aria-busy="true" className="flex flex-col gap-2 px-3">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <StateMessage
          type="empty"
          icon={Icon}
          title={empty}
          description="수집을 시작한 지 1시간이 지나야 변동률이 계산돼요"
        />
      ) : (
        <ol className="flex flex-col">
          {entries.map((entry) => (
            <RankingRow key={entry.item.id} entry={entry} />
          ))}
        </ol>
      )}
    </section>
  )
}
