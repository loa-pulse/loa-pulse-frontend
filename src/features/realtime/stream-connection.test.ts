import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createStreamConnection, type StreamState } from './stream-connection'

/** 테스트용 EventSource. 열기, 오류, 이벤트를 직접 일으킨다 */
class FakeEventSource {
  static instances: FakeEventSource[] = []
  readyState = 0
  onopen: ((ev: Event) => unknown) | null = null
  onerror: ((ev: Event) => unknown) | null = null
  listeners = new Map<string, (ev: Event) => void>()
  closed = false
  url: string

  constructor(url: string) {
    this.url = url
    FakeEventSource.instances.push(this)
  }
  addEventListener(type: string, listener: (ev: Event) => void) {
    this.listeners.set(type, listener)
  }
  close() {
    this.closed = true
    this.readyState = 2
  }
  open() {
    this.readyState = 1
    this.onopen?.(new Event('open'))
  }
  fail(readyState: number) {
    this.readyState = readyState
    this.onerror?.(new Event('error'))
  }
  emit(type: string, data: string) {
    this.listeners.get(type)?.(new MessageEvent(type, { data }))
  }
}

function setup() {
  const states: StreamState[] = []
  const events: unknown[] = []
  const connection = createStreamConnection({
    url: '/api/stream?items=1',
    onEvent: (type, data) => events.push({ type, data }),
    onStateChange: (s) => states.push(s),
    createEventSource: (url) =>
      new FakeEventSource(url) as unknown as EventSource,
  })
  const latest = () => FakeEventSource.instances.at(-1)!
  return { states, events, connection, latest }
}

describe('createStreamConnection', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    FakeEventSource.instances = []
  })
  afterEach(() => vi.useRealTimers())

  it('연결되면 live가 되고, 이벤트를 JSON으로 풀어 넘긴다', () => {
    const { states, events, latest } = setup()
    latest().open()
    latest().emit('price', '{"itemId":1,"currentPrice":10}')

    expect(states).toEqual(['connecting', 'live'])
    expect(events).toEqual([
      { type: 'price', data: { itemId: 1, currentPrice: 10 } },
    ])
  })

  it('형식이 맞지 않는 이벤트는 버린다', () => {
    const { events, latest } = setup()
    latest().emit('freshness', 'not json')
    expect(events).toEqual([])
  })

  it('브라우저가 스스로 재연결하는 중이면 reconnecting만 알린다', () => {
    const { states, latest } = setup()
    latest().open()
    latest().fail(0)

    expect(states.at(-1)).toBe('reconnecting')
    expect(FakeEventSource.instances).toHaveLength(1)
  })

  it('연결이 닫히면 1초, 2초 … 간격으로 직접 다시 연결한다', () => {
    const { states, latest } = setup()
    latest().fail(2)
    expect(states.at(-1)).toBe('reconnecting')

    vi.advanceTimersByTime(999)
    expect(FakeEventSource.instances).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(FakeEventSource.instances).toHaveLength(2)

    latest().fail(2)
    vi.advanceTimersByTime(2_000)
    expect(FakeEventSource.instances).toHaveLength(3)

    latest().open()
    expect(states.at(-1)).toBe('live')
  })

  it('여러 번 실패하면 offline으로 알리고 30초마다 계속 시도한다', () => {
    const { states, latest } = setup()
    for (const delay of [1_000, 2_000, 5_000, 10_000]) {
      latest().fail(2)
      vi.advanceTimersByTime(delay)
    }
    latest().fail(2)
    expect(states.at(-1)).toBe('offline')

    vi.advanceTimersByTime(30_000)
    expect(FakeEventSource.instances).toHaveLength(6)
  })

  it('닫으면 연결과 재시도 타이머를 모두 멈춘다', () => {
    const { connection, latest } = setup()
    const first = latest()
    first.fail(2)
    connection.close()
    vi.advanceTimersByTime(60_000)

    expect(FakeEventSource.instances).toHaveLength(1)
  })
})
