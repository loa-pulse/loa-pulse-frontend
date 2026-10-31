import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'

const links = [
  { to: '/items', label: '시세' },
  { to: '/alerts', label: '내 알림' },
  { to: '/status', label: '서비스 상태' },
]

/** 헤더 메뉴. 현재 경로의 메뉴만 밝게 보여준다 */
export function HeaderNav() {
  return (
    <nav aria-label="주 메뉴" className="flex items-center gap-1">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            cn(
              'rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors hover:text-foreground',
              isActive ? 'text-foreground' : 'text-muted-foreground',
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}
