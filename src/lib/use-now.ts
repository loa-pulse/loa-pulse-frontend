import { useEffect, useState } from 'react'

/**
 * 일정 간격으로 바뀌는 현재 시각. "N초 전"처럼 시간이 흐르면 달라지는 표시에 쓴다.
 * 같은 화면에서 여러 번 불러도 각자 타이머를 가지므로, 목록에서는 한 번만 부르고 내려준다.
 */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])

  return now
}
