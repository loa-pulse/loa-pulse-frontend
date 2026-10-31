import { useEffect, useState } from 'react'

/** 탭이 이 시간보다 오래 숨겨져 있으면 실시간 연결을 끊는다 (기획 4.6, 05-api "연결") */
export const HIDDEN_DISCONNECT_MS = 10 * 60_000

/**
 * 탭이 보이거나, 숨겨진 지 10분이 안 됐으면 true.
 * 잠깐 다른 탭을 보는 동안에는 연결을 유지하고, 오래 비워 두면 서버 연결을 아낀다.
 */
export function useTabActive(hiddenLimitMs = HIDDEN_DISCONNECT_MS): boolean {
  const [active, setActive] = useState(true)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    function handleChange() {
      if (timer) clearTimeout(timer)
      timer = null
      if (document.visibilityState === 'visible') {
        setActive(true)
      } else {
        timer = setTimeout(() => setActive(false), hiddenLimitMs)
      }
    }

    document.addEventListener('visibilitychange', handleChange)
    return () => {
      document.removeEventListener('visibilitychange', handleChange)
      if (timer) clearTimeout(timer)
    }
  }, [hiddenLimitMs])

  return active
}
