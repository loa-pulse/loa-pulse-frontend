import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ActivityIcon } from 'lucide-react'
import { HeaderNav } from './header-nav'
import { HeaderSearch } from './header-search'

type HeaderProps = {
  /** 오른쪽 영역 (실시간 표시, 로그인 버튼 또는 사용자 메뉴) */
  actions?: ReactNode
}

/** 공통 헤더 (Figma Header). 로고, 메뉴, 검색, 오른쪽 동작 */
export function Header({ actions }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center gap-8 px-10">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand-gold">
            <ActivityIcon
              aria-hidden="true"
              className="size-[18px] text-primary-foreground"
            />
          </span>
          <span className="text-xl font-bold tracking-tight">LoaPulse</span>
        </Link>
        <HeaderNav />
        <div className="flex-1" />
        <HeaderSearch />
        {actions && <div className="flex items-center gap-4">{actions}</div>}
      </div>
    </header>
  )
}
