import { createContext, useContext, useEffect } from 'react'
import type { ServiceStatus } from '@/api/schema'
import type { StreamState } from './stream-connection'

/** 화면이 구독하는 대상. 목록은 보이는 페이지의 아이템, 상세는 그 아이템 하나, 메인은 랭킹 */
export type Subscription = {
  items?: number[]
  ranking?: boolean
}

export type RealtimeContextValue = {
  state: StreamState
  /** freshness 이벤트의 서비스 상태. 연결 전에는 정상으로 본다 */
  serviceStatus: ServiceStatus
  /** 구독을 등록하고, 해제 함수를 돌려준다 */
  subscribe: (subscription: Subscription) => () => void
}

export const RealtimeContext = createContext<RealtimeContextValue | null>(null)

function useRealtimeContext() {
  const value = useContext(RealtimeContext)
  if (!value) throw new Error('RealtimeProvider 안에서만 쓸 수 있다')
  return value
}

/** 실시간 연결 상태와 서비스 상태 */
export function useRealtimeStatus() {
  const { state, serviceStatus } = useRealtimeContext()
  return { state, serviceStatus }
}

/** 화면이 보이는 동안 대상을 구독한다. 대상이 바뀌면 다시 구독한다 */
export function useRealtimeSubscription(subscription: Subscription) {
  const { subscribe } = useRealtimeContext()
  const itemsKey = subscription.items?.join(',') ?? ''
  const ranking = subscription.ranking ?? false

  useEffect(() => {
    const items = itemsKey ? itemsKey.split(',').map(Number) : []
    return subscribe({ items, ranking })
  }, [subscribe, itemsKey, ranking])
}
