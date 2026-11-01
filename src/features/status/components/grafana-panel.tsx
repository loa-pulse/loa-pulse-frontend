import { ExternalLinkIcon, LineChartIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { env } from '@/lib/env'

/**
 * 반영 지연 추이 그래프 (Figma 상태 화면 가운데). 추이는 Grafana 공개 대시보드를 임베드한다 (D22, D30).
 * 주소가 없으면(목업, 프리뷰) 자리만 보여준다.
 */
export function GrafanaPanel() {
  const url = env.grafanaDashboardUrl

  return (
    <section
      aria-labelledby="grafana-panel"
      className="flex flex-col gap-4 rounded-[14px] border bg-card p-5"
    >
      <div className="flex items-center gap-3">
        <h2 id="grafana-panel" className="text-base font-bold">
          반영 지연 추이
        </h2>
        <p className="text-xs text-muted-foreground">
          최근 24시간 · 원본이 바뀐 뒤 반영되기까지
        </p>
        {url && (
          <Button asChild variant="secondary" size="sm" className="ml-auto">
            <a href={url} target="_blank" rel="noreferrer">
              Grafana 공개 대시보드
              <ExternalLinkIcon aria-hidden="true" />
            </a>
          </Button>
        )}
      </div>

      {url ? (
        <iframe
          src={url}
          title="반영 지연 추이 (Grafana 공개 대시보드)"
          loading="lazy"
          className="h-[260px] w-full rounded-lg border-0 bg-background"
        />
      ) : (
        <div className="flex h-[260px] flex-col items-center justify-center gap-2 rounded-lg bg-background text-center">
          <LineChartIcon
            aria-hidden="true"
            className="size-6 text-muted-foreground"
          />
          <p className="text-sm font-medium">
            반영 지연 추이는 운영 환경에서 보여요
          </p>
          <p className="text-xs text-muted-foreground">
            Grafana 공개 대시보드(grafana.{'{도메인}'})를 이 자리에 임베드해요
          </p>
        </div>
      )}
    </section>
  )
}
