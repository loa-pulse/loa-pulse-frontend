import { Toaster as Sonner, type ToasterProps } from 'sonner'

/**
 * 화면 오른쪽 아래 토스트. 다크 테마만 쓰므로 next-themes 없이 고정한다.
 * 색은 Figma Toast(popover 배경, border 테두리)를 따른다.
 */
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
