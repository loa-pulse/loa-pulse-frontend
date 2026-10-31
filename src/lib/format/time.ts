/** 화면의 날짜와 시각은 모두 한국 시간으로 보여준다. API는 UTC로 준다 */
const TIME_ZONE = 'Asia/Seoul'

const partsFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

type KstParts = {
  year: number
  month: number
  day: number
  hour: string
  minute: string
  second: string
}

function kstParts(date: Date): KstParts {
  const parts = Object.fromEntries(
    partsFormat.formatToParts(date).map((p) => [p.type, p.value]),
  )
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  }
}

function toDate(value: string | Date): Date {
  return typeof value === 'string' ? new Date(value) : value
}

/** "14:32" 또는 초까지 "14:32:05" (KST) */
export function formatKstTime(
  value: string | Date,
  { withSeconds = false } = {},
): string {
  const p = kstParts(toDate(value))
  return withSeconds
    ? `${p.hour}:${p.minute}:${p.second}`
    : `${p.hour}:${p.minute}`
}

/** "10월 31일 14:32" (KST) */
export function formatKstDateTime(value: string | Date): string {
  const p = kstParts(toDate(value))
  return `${p.month}월 ${p.day}일 ${p.hour}:${p.minute}`
}

/** "10/31" (KST). API의 `yyyy-MM-dd` 날짜 문자열도 받는다 */
export function formatShortDate(value: string): string {
  const [, month, day] = value.split('-').map(Number)
  return `${month}/${day}`
}

/**
 * 지금으로부터 얼마나 지났는지.
 * 1분 미만 "N초 전", 1시간 미만 "N분 전", 오늘(KST) "HH:mm", 그 전 "M월 D일 HH:mm".
 * 테스트할 수 있도록 현재 시각을 인자로 받는다.
 */
export function formatRelativeTime(
  value: string | Date,
  now: Date = new Date(),
): string {
  const date = toDate(value)
  const seconds = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 1000),
  )
  if (seconds < 60) return `${seconds}초 전`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`

  const d = kstParts(date)
  const n = kstParts(now)
  const sameDay = d.year === n.year && d.month === n.month && d.day === n.day
  return sameDay ? formatKstTime(date) : formatKstDateTime(date)
}

/** 지금으로부터 몇 초 지났는지. 오래된 갱신 시각 표시(1분 초과)에 쓴다 */
export function secondsSince(
  value: string | Date,
  now: Date = new Date(),
): number {
  return Math.max(
    0,
    Math.floor((now.getTime() - toDate(value).getTime()) / 1000),
  )
}
