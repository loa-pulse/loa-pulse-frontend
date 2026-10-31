import { LiveIndicator, type LiveState } from '@/components/live-indicator'
import { useRealtimeStatus } from '../realtime-context'
import type { StreamState } from '../stream-connection'

const shown: Record<StreamState, { state: LiveState; label?: string }> = {
  connecting: { state: 'reconnecting', label: '연결 중' },
  live: { state: 'live' },
  reconnecting: { state: 'reconnecting' },
  offline: { state: 'offline' },
}

/** 실시간 연결 상태 표시. liveLabel로 연결됐을 때의 문구를 바꾼다 (예: "실시간 반영 중") */
export function RealtimeIndicator({ liveLabel }: { liveLabel?: string }) {
  const { state } = useRealtimeStatus()
  const { state: liveState, label } = shown[state]
  return (
    <LiveIndicator
      state={liveState}
      label={state === 'live' ? (liveLabel ?? label) : label}
    />
  )
}
