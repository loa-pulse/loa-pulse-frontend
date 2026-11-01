import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import type { ServiceStatus } from '@/api/schema'
import { apiUrl } from '@/api/client'
import { applyNotificationEvent } from '@/features/alerts/notification-toast'
import {
  applyFreshnessEvent,
  applyPriceEvent,
  applyRankingEvent,
} from './cache-updates'
import type { StreamEventMap, StreamEventType } from './events'
import { RealtimeContext, type Subscription } from './realtime-context'
import { createStreamConnection, type StreamState } from './stream-connection'
import { useTabActive } from './use-tab-active'

/** 이벤트 이름과 데이터 형식을 묶은 구분 유니온. switch에서 data 타입이 좁혀진다 */
type AnyStreamEvent = {
  [K in StreamEventType]: { type: K; data: StreamEventMap[K] }
}[StreamEventType]

/** 서버가 한 연결에서 받는 아이템 수 상한 (05-api "연결") */
const MAX_ITEMS = 50

function toStreamQuery(subscriptions: Iterable<Subscription>): string {
  const items = new Set<number>()
  let ranking = false
  for (const s of subscriptions) {
    s.items?.forEach((id) => items.add(id))
    ranking ||= s.ranking ?? false
  }
  const ids = [...items].sort((a, b) => a - b).slice(0, MAX_ITEMS)
  return apiUrl('/api/stream', {
    items: ids.length ? ids.join(',') : undefined,
    ranking: ranking || undefined,
  }).toString()
}

/**
 * 브라우저 하나당 SSE 연결 하나를 둔다 (D4). 화면들의 구독을 모아 연결 주소를 만들고,
 * 구독이 바뀌면 다시 연결한다. 받은 이벤트는 쿼리 캐시에 바로 반영한다.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const tabActive = useTabActive()
  const subscriptions = useRef(new Map<number, Subscription>())
  const nextId = useRef(0)
  const [url, setUrl] = useState(() => toStreamQuery([]))
  const [state, setState] = useState<StreamState>('connecting')
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>('NORMAL')

  const subscribe = useCallback((subscription: Subscription) => {
    const id = nextId.current++
    subscriptions.current.set(id, subscription)
    setUrl(toStreamQuery(subscriptions.current.values()))
    return () => {
      subscriptions.current.delete(id)
      setUrl(toStreamQuery(subscriptions.current.values()))
    }
  }, [])

  useEffect(() => {
    if (!tabActive) return
    const connection = createStreamConnection({
      url,
      onStateChange: setState,
      onEvent: (type, data) => {
        const event = { type, data } as AnyStreamEvent
        switch (event.type) {
          case 'price':
            applyPriceEvent(queryClient, event.data)
            break
          case 'freshness':
            applyFreshnessEvent(queryClient, event.data)
            setServiceStatus(event.data.serviceStatus)
            break
          case 'ranking':
            applyRankingEvent(queryClient, event.data)
            break
          case 'notification':
            applyNotificationEvent(queryClient, event.data, (itemId) =>
              navigate(`/items/${itemId}`),
            )
            break
        }
      },
    })
    return () => connection.close()
  }, [url, tabActive, queryClient, navigate])

  // 탭을 오래 비워 연결을 끊은 동안은 연결 끊김으로 보여준다
  const shownState: StreamState = tabActive ? state : 'offline'
  const value = useMemo(
    () => ({ state: shownState, serviceStatus, subscribe }),
    [shownState, serviceStatus, subscribe],
  )

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
}
