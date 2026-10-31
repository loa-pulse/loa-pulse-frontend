import { useState, type FormEvent } from 'react'
import { ArrowDownUpIcon, SearchIcon } from 'lucide-react'
import type { Category, CategoryCode, ItemSort } from '@/api/schema'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ITEM_SORTS } from '../use-items-params'

type ItemsToolbarProps = {
  categories: Category[]
  category: CategoryCode
  q: string
  sort: ItemSort
  onCategoryChange: (category: CategoryCode) => void
  onQueryChange: (q: string) => void
  onSortChange: (sort: ItemSort) => void
}

/** 카테고리 안 검색. Enter를 누르면 적용한다 */
function CategorySearch({
  categoryName,
  q,
  onQueryChange,
}: {
  categoryName: string
  q: string
  onQueryChange: (q: string) => void
}) {
  const [value, setValue] = useState(q)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onQueryChange(value)
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative w-64">
      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        aria-label={`${categoryName}에서 검색`}
        placeholder={`${categoryName}에서 검색`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 bg-card pl-9"
      />
    </form>
  )
}

/** 시세 목록 도구 막대 (Figma Toolbar): 카테고리 탭, 검색, 정렬 */
export function ItemsToolbar({
  categories,
  category,
  q,
  sort,
  onCategoryChange,
  onQueryChange,
  onSortChange,
}: ItemsToolbarProps) {
  const categoryName =
    categories.find((c) => c.code === category)?.name ?? '전체'

  return (
    <div className="flex items-center gap-4">
      <Tabs
        value={category}
        onValueChange={(v) => onCategoryChange(v as CategoryCode)}
        className="flex-1"
      >
        <TabsList variant="line" aria-label="카테고리" className="gap-1">
          {categories.map((c) => (
            <TabsTrigger
              key={c.code}
              value={c.code}
              className="h-8 rounded-md px-3 text-[13px] after:hidden data-active:bg-secondary dark:data-active:border-transparent dark:data-active:bg-secondary"
            >
              {c.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {/* 검색어가 바깥에서 바뀌면(헤더 검색, 뒤로 가기) 입력칸도 다시 맞춘다 */}
      <CategorySearch
        key={`${category}:${q}`}
        categoryName={categoryName}
        q={q}
        onQueryChange={onQueryChange}
      />
      <Select value={sort} onValueChange={(v) => onSortChange(v as ItemSort)}>
        <SelectTrigger aria-label="정렬" className="h-9 w-44">
          <ArrowDownUpIcon
            aria-hidden="true"
            className="text-muted-foreground"
          />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ITEM_SORTS.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
