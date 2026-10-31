import {
  STREAM_EVENT_TYPES,
  type StreamEventMap,
  type StreamEventType,
} from './events'

/**
 * - connecting: 처음 연결하는 중
 * - live: 연결됨
 * - reconnecting: 끊겨서 다시 연결하는 중
 * - offline: 여러 번 실패해 오래 기다렸다가 다시 시도하는 중
 */
export type StreamState = 'connecting' | 'live' | 'reconnecting' | 'offline'

/** 브라우저가 스스로 재연결하지 못하고 연결을 닫았을 때 다시 시도하기까지 기다리는 시간 */
export const RETRY_DELAYS_MS = [1_000, 2_000, 5_000, 10_000, 30_000]

type EventSourceLike = Pick<
  EventSource,
  'readyState' | 'close' | 'addEventListener'
> & {
  onopen: ((ev: Event) => unknown) | null
  onerror: ((ev: Event) => unknown) | null
}

type Options = {
  url: string
  onEvent: <T extends StreamEventType>(type: T, data: StreamEventMap[T]) => void
  onStateChange: (state: StreamState) => void
  /** 테스트에서 가짜 EventSource를 넣는다 */
  createEventSource?: (url: string) => EventSourceLike
}

const CLOSED = 2

const defaultEventSource = (url: string) =>
  // 로그인 사용자는 세션 쿠키로 식별한다 (D28)
  new EventSource(url, { withCredentials: true })

/**
 * SSE 연결 하나를 관리한다 (D4: 브라우저 하나당 연결 하나).
 * 브라우저 EventSource는 끊기면 스스로 재연결하지만, 서버가 오류 상태로 응답하면 연결을 닫고 멈춘다.
 * 그때는 RETRY_DELAYS_MS 간격으로 직접 다시 연결한다.
 */
export function createStreamConnection({
  url,
  onEvent,
  onStateChange,
  createEventSource = defaultEventSource,
}: Options) {
  let source: EventSourceLike | null = null
  let retryTimer: ReturnType<typeof setTimeout> | null = null
  let attempts = 0
  let closed = false

  function connect() {
    source = createEventSource(url)

    source.onopen = () => {
      attempts = 0
      onStateChange('live')
    }

    source.onerror = () => {
      if (closed || !source) return
      if (source.readyState !== CLOSED) {
        // 브라우저가 스스로 다시 연결하는 중
        onStateChange('reconnecting')
        return
      }
      source.close()
      source = null
      const delay =
        RETRY_DELAYS_MS[Math.min(attempts, RETRY_DELAYS_MS.length - 1)]
      onStateChange(
        attempts >= RETRY_DELAYS_MS.length - 1 ? 'offline' : 'reconnecting',
      )
      attempts += 1
      retryTimer = setTimeout(connect, delay)
    }

    for (const type of STREAM_EVENT_TYPES) {
      source.addEventListener(type, (event) => {
        try {
          onEvent(type, JSON.parse((event as MessageEvent<string>).data))
        } catch {
          // 형식이 맞지 않는 이벤트는 버린다. 다음 이벤트가 최신 값을 다시 준다
        }
      })
    }
  }

  onStateChange('connecting')
  connect()

  return {
    close() {
      closed = true
      if (retryTimer) clearTimeout(retryTimer)
      source?.close()
      source = null
    },
  }
}
