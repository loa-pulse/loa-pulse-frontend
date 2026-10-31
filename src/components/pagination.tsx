import { Button } from '@/components/ui/button'
import { pageNumbers } from '@/lib/page-numbers'

type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

/** 페이지 이동 (Figma Pagination). 1페이지뿐이면 그리지 않는다 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="페이지" className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        이전
      </Button>
      {pageNumbers(page, totalPages).map((n, i) =>
        n === '…' ? (
          <span
            key={`gap-${i}`}
            aria-hidden="true"
            className="px-2 text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Button
            key={n}
            variant={n === page ? 'secondary' : 'ghost'}
            size="sm"
            aria-current={n === page ? 'page' : undefined}
            onClick={() => onPageChange(n)}
          >
            {n}
          </Button>
        ),
      )}
      <Button
        variant="ghost"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        다음
      </Button>
    </nav>
  )
}
