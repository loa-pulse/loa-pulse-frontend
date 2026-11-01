import { TriangleAlertIcon } from 'lucide-react'
import type { Incident } from '@/api/schema'
import { formatMinutes } from '@/lib/format/duration'
import { formatKstDateTime } from '@/lib/format/time'
import { cn } from '@/lib/utils'

/** 최근 30일 장애 (Figma 상태 화면 오른쪽 아래, D30) */
export function IncidentList({ incidents }: { incidents: Incident[] }) {
  return (
    <section
      aria-labelledby="incident-list"
      className="flex flex-col gap-2 rounded-[14px] border bg-card p-5"
    >
      <h2 id="incident-list" className="text-base font-bold">
        최근 장애
      </h2>
      <p className="text-xs text-muted-foreground">
        최근 30일 · {incidents.length}건
      </p>

      {incidents.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          최근 30일 동안 장애가 없었어요
        </p>
      ) : (
        <ul className="divide-y border-t">
          {incidents.map((incident) => (
            <li key={incident.id} className="flex gap-3 py-3">
              <TriangleAlertIcon
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-status-warning"
              />
              <div className="flex flex-1 flex-col gap-0.5">
                <p className="text-sm font-medium">{incident.title}</p>
                <p className="text-xs text-muted-foreground">
                  <time dateTime={incident.startedAt}>
                    {formatKstDateTime(incident.startedAt)}
                  </time>
                  {incident.durationMinutes !== null &&
                    ` · ${formatMinutes(incident.durationMinutes)}`}
                  {' · '}
                  {incident.description}
                </p>
              </div>
              <span
                className={cn(
                  'h-fit rounded-full px-2 py-0.5 text-xs whitespace-nowrap',
                  incident.resolved
                    ? 'bg-status-live-subtle text-status-live'
                    : 'bg-status-warning-subtle text-status-warning',
                )}
              >
                {incident.resolved ? '해결됨' : '진행 중'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
