import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'

/**
 * 헤더 검색. Enter를 누르면 시세 목록의 전체 카테고리에서 검색한다.
 * 자동완성은 만들지 않는다 (08-frontend-plan "정한 것").
 */
export function HeaderSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const q = query.trim()
    if (!q) return
    const params = new URLSearchParams({ category: 'all', q })
    navigate(`/items?${params}`)
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative w-72">
      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        aria-label="아이템 검색"
        placeholder="아이템 이름으로 검색"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-9 bg-card pl-9"
      />
    </form>
  )
}
