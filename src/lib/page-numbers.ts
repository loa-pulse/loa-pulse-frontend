/**
 * 페이지 버튼 목록. 처음, 끝, 현재 앞뒤 한 개를 보여주고 나머지는 "…"로 줄인다.
 * 예: (1, 9) → [1, 2, '…', 9], (5, 9) → [1, '…', 4, 5, 6, '…', 9]
 */
export function pageNumbers(page: number, total: number): (number | '…')[] {
  const shown = new Set([1, total, page - 1, page, page + 1])
  const pages = [...shown]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b)

  const result: (number | '…')[] = []
  for (const n of pages) {
    const prev = result.at(-1)
    if (typeof prev === 'number' && n - prev > 1) {
      result.push(n - prev === 2 ? prev + 1 : '…')
    }
    result.push(n)
  }
  return result
}
