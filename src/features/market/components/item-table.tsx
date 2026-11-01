import type { ReactNode } from 'react'
import type { ItemSummary } from '@/api/schema'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ItemTableRow } from './item-table-row'

const columns = [
  { label: '아이템', className: 'pl-4' },
  { label: '현재 최저가', className: 'w-40 text-right' },
  { label: '전일 대비', className: 'w-30 text-right' },
  { label: '최근 1시간', className: 'w-30 text-right' },
  { label: '마지막 갱신', className: 'w-30 text-right' },
  { label: '관심', className: 'w-14 text-center' },
  { label: '', className: 'w-10' },
]

type ItemTableProps = {
  items: ItemSummary[] | undefined
  loading: boolean
  now: Date
  /** 목록 대신 보여줄 안내 (빈 상태, 검색 결과 없음, 오류) */
  message?: ReactNode
}

/** 로딩 중 행 (Figma Skeleton/TableRow). 아래 행일수록 흐려진다 */
function SkeletonRow({ index }: { index: number }) {
  return (
    <TableRow
      aria-hidden="true"
      className="h-16 hover:bg-transparent"
      style={{ opacity: 1 - index * 0.07 }}
    >
      <TableCell className="pl-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="ml-auto h-3.5 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="ml-auto h-5 w-14" />
      </TableCell>
      <TableCell>
        <Skeleton className="ml-auto h-5 w-14" />
      </TableCell>
      <TableCell>
        <Skeleton className="ml-auto h-5 w-14" />
      </TableCell>
      <TableCell />
      <TableCell />
    </TableRow>
  )
}

/** 시세 표 (Figma ItemTable). 카드 모양 안에 머리글과 행을 그린다 */
export function ItemTable({ items, loading, now, message }: ItemTableProps) {
  return (
    <div className="overflow-hidden rounded-[14px] border bg-card">
      <Table aria-busy={loading}>
        <TableHeader>
          <TableRow className="h-10 hover:bg-transparent">
            {columns.map((col, i) => (
              <TableHead
                key={i}
                className={`text-xs font-normal text-muted-foreground ${col.className}`}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading &&
            Array.from({ length: 10 }, (_, i) => (
              <SkeletonRow key={i} index={i} />
            ))}
          {!loading && message && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length}>{message}</TableCell>
            </TableRow>
          )}
          {!loading &&
            !message &&
            items?.map((item) => (
              <ItemTableRow key={item.id} item={item} now={now} />
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
