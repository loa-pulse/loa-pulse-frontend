import { secondsSince } from '@/lib/format/time'

/** 이 시간이 지나도록 새 값을 확인하지 못하면 갱신 시각을 주황색으로 보여준다 */
export const STALE_AFTER_SECONDS = 60

export function isStale(refreshedAt: string, now: Date): boolean {
  return secondsSince(refreshedAt, now) > STALE_AFTER_SECONDS
}

/**
 * 아이템 카테고리 줄. 가격은 묶음 기준이므로 묶음 단위가 2 이상이면 함께 보여준다.
 * 예: "재련 재료 · 100개 묶음"
 */
export function itemCaption(categoryName: string, bundleCount: number) {
  return bundleCount > 1
    ? `${categoryName} · ${bundleCount}개 묶음`
    : categoryName
}
