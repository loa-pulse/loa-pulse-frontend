import type { ServiceHealth } from '@/api/schema'

/**
 * 서비스 상태 목업. 수치는 Figma 상태 화면의 예시 값이다.
 * 실제 값은 M5에서 collector가 계산한다 (D30).
 */
export function serviceHealth(now: Date): ServiceHealth {
  const daysAgo = (days: number, hourUtc: number, minute: number) => {
    const date = new Date(now)
    date.setUTCDate(date.getUTCDate() - days)
    date.setUTCHours(hourUtc, minute, 0, 0)
    return date.toISOString()
  }

  return {
    serviceStatus: 'NORMAL',
    updatedAt: new Date(now.getTime() - 20_000).toISOString(),
    metrics: {
      hotDelayP95Seconds: 24,
      hotDelayBaselineSeconds: 75,
      callEfficiencyPercent: 62,
      callEfficiencyBaselinePercent: 21,
      rateLimitExceededCount: 0,
      alertDelayP95Seconds: 8,
      duplicateAlertCount: 0,
    },
    tiers: [
      { tier: 'HOT', itemCount: 120, intervalSeconds: 15, avgDelaySeconds: 11 },
      {
        tier: 'NORMAL',
        itemCount: 640,
        intervalSeconds: 60,
        avgDelaySeconds: 38,
      },
      {
        tier: 'COLD',
        itemCount: 524,
        intervalSeconds: 300,
        avgDelaySeconds: 160,
      },
    ],
    incidents: [
      {
        id: 3,
        title: '로스트아크 API 응답 지연',
        startedAt: daysAgo(3, 18, 12),
        durationMinutes: 14,
        description: '서킷 브레이커가 열려 호출을 멈췄다가 자동 복구됐어요',
        resolved: true,
      },
      {
        id: 2,
        title: '로스트아크 정기 점검',
        startedAt: daysAgo(10, 21, 0),
        durationMinutes: 360,
        description: '점검 동안 수집을 멈추고 마지막 시세를 보여 줬어요',
        resolved: true,
      },
      {
        id: 1,
        title: '실시간 연결 재접속',
        startedAt: daysAgo(14, 13, 40),
        durationMinutes: 2,
        description: '서버 재시작으로 실시간 연결이 다시 맺어졌어요',
        resolved: true,
      },
    ],
  }
}
