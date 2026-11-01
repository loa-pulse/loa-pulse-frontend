import { toast } from 'sonner'
import { SendIcon } from 'lucide-react'
import type { DmStatus, Me } from '@/api/schema'
import { Button } from '@/components/ui/button'
import { formatKstDateTime } from '@/lib/format/time'
import { cn } from '@/lib/utils'
import { useDmTest } from '../queries'

const results: Record<
  Exclude<DmStatus, 'UNKNOWN'>,
  { badge: string; reason?: string; ok: boolean }
> = {
  OK: { badge: '도착', ok: true },
  DM_BLOCKED: {
    badge: '발송 실패',
    reason: 'DM 차단 (서버 멤버 DM 허용 꺼짐)',
    ok: false,
  },
  LEFT_GUILD: {
    badge: '발송 실패',
    reason: 'LoaPulse 디스코드 서버에 없음',
    ok: false,
  },
}

function LastResult({ me }: { me: Me }) {
  if (!me.lastDmTestAt || me.dmStatus === 'UNKNOWN') {
    return (
      <p className="text-xs text-muted-foreground">
        아직 테스트하지 않았어요. 처음 한 번은 알림이 도착하는지 확인해 주세요
      </p>
    )
  }
  const result = results[me.dmStatus]
  return (
    <p className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">마지막 테스트</span>
      <span className="font-medium tabular-nums">
        {formatKstDateTime(me.lastDmTestAt)}
      </span>
      <span
        className={cn(
          'rounded-full px-2 py-0.5',
          result.ok
            ? 'bg-status-live-subtle text-status-live'
            : 'bg-price-rise-subtle text-destructive',
        )}
      >
        {result.badge}
      </span>
      {result.reason && (
        <span className="text-destructive">{result.reason}</span>
      )}
    </p>
  )
}

/** 설정의 "DM 수신 확인" 카드 (흐름 3: 최초 1회 테스트 DM으로 수신 확인) */
export function DmTestCard({ me }: { me: Me }) {
  const dmTest = useDmTest()

  const send = () =>
    dmTest.mutate(undefined, {
      onSuccess: (result) =>
        result.dmStatus === 'OK'
          ? toast.success('테스트 DM을 보냈어요. 디스코드를 확인해 주세요')
          : toast.error('DM을 보내지 못했어요. 위 안내를 확인해 주세요'),
      onError: () => toast.error('테스트 DM을 보내지 못했어요'),
    })

  return (
    <section
      aria-labelledby="dm-test-card"
      className="flex flex-col gap-4 rounded-[14px] border bg-card p-6"
    >
      <h2 id="dm-test-card" className="text-base font-bold">
        DM 수신 확인
      </h2>
      <div className="flex items-start gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-sm font-medium">테스트 DM 보내기</p>
          <p className="text-xs text-muted-foreground">
            알림이 실제로 도착하는지 확인해요. 받지 못했다면 안내대로 디스코드
            설정을 바꾼 뒤 다시 시도해 주세요.
          </p>
        </div>
        <Button variant="secondary" disabled={dmTest.isPending} onClick={send}>
          <SendIcon aria-hidden="true" />
          테스트 DM 보내기
        </Button>
      </div>
      <div className="rounded-lg bg-background px-3 py-2.5">
        <LastResult me={me} />
      </div>
    </section>
  )
}
