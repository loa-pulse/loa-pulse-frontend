import { useState } from 'react'
import { gradeThumbClass, gradeTone } from '@/lib/item-grade'
import { cn } from '@/lib/utils'

const sizes = {
  sm: 'size-9 rounded-lg text-[13px]',
  lg: 'size-12 rounded-[10px] text-base',
}

type ItemThumbProps = {
  name: string
  grade: string
  iconUrl: string | null
  size?: keyof typeof sizes
  className?: string
}

/**
 * 아이템 썸네일 (Figma ItemThumb). 실제 게임 아이콘에 등급 색 테두리를 두른다.
 * 아이콘을 불러오지 못하면 등급 색 배경에 이름 첫 글자를 보여준다.
 * 아이템 이름은 옆에 글자로 나오므로 이미지는 장식으로 둔다.
 */
export function ItemThumb({
  name,
  grade,
  iconUrl,
  size = 'sm',
  className,
}: ItemThumbProps) {
  const [failed, setFailed] = useState(false)
  const showIcon = iconUrl !== null && !failed

  return (
    <span
      aria-hidden="true"
      data-grade={gradeTone(grade)}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden border font-medium',
        sizes[size],
        gradeThumbClass[gradeTone(grade)],
        className,
      )}
    >
      {showIcon ? (
        <img
          src={iconUrl}
          alt=""
          loading="lazy"
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        name.charAt(0)
      )}
    </span>
  )
}
