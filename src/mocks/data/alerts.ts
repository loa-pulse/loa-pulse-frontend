import type {
  Alert,
  AlertChannels,
  AlertDirection,
  AlertList,
  AlertRequest,
  AlertStatus,
  Notification,
} from '@/api/schema'
import { findSeed } from './market'

/**
 * 목업 알림 저장소. 계정 목업처럼 브라우저 저장소에 남겨 새로고침해도 유지한다.
 * 처음에는 화면을 바로 볼 수 있게 예시 알림과 받은 알림 내역을 넣어 둔다.
 * 테스트는 매번 저장소를 비우므로 항상 같은 예시로 시작한다.
 */
const STORAGE_KEY = 'loapulse.mock.alerts'
export const ACTIVE_ALERT_LIMIT = 20

type StoredAlert = {
  id: number
  itemId: number
  direction: AlertDirection
  threshold: number
  channels: AlertChannels
  status: AlertStatus
  triggeredAt: string | null
  createdAt: string
}

type AlertsState = {
  nextId: number
  alerts: StoredAlert[]
  notifications: Notification[]
}

const both = { dm: true, web: true }
const dmOnly = { dm: true, web: false }

const seedState = (): AlertsState => ({
  nextId: 5,
  alerts: [
    alert(1, 66102007, 'BELOW', 790, both, 'ACTIVE', '2026-10-30T10:00:00Z'),
    alert(
      2,
      65200505,
      'BELOW',
      100000,
      dmOnly,
      'ACTIVE',
      '2026-10-29T10:00:00Z',
    ),
    alert(3, 66102005, 'ABOVE', 30, dmOnly, 'PAUSED', '2026-10-28T10:00:00Z'),
    {
      ...alert(
        4,
        65203505,
        'BELOW',
        80000,
        both,
        'TRIGGERED',
        '2026-10-27T10:00:00Z',
      ),
      triggeredAt: '2026-10-31T05:32:00Z',
    },
  ],
  notifications: [
    notification(
      103,
      4,
      65203505,
      78799,
      'BELOW',
      80000,
      'SENT',
      true,
      '2026-10-31T05:32:00Z',
    ),
    notification(
      102,
      9,
      65200505,
      104980,
      'BELOW',
      105000,
      'FAILED',
      true,
      '2026-10-28T00:47:00Z',
    ),
    notification(
      101,
      8,
      66102007,
      820,
      'BELOW',
      830,
      'SENT',
      false,
      '2026-10-25T09:12:00Z',
    ),
  ],
})

function alert(
  id: number,
  itemId: number,
  direction: AlertDirection,
  threshold: number,
  channels: AlertChannels,
  status: AlertStatus,
  createdAt: string,
): StoredAlert {
  return {
    id,
    itemId,
    direction,
    threshold,
    channels,
    status,
    triggeredAt: null,
    createdAt,
  }
}

function itemOf(itemId: number) {
  const seed = findSeed(itemId)
  return {
    id: itemId,
    name: seed?.name ?? `아이템 ${itemId}`,
    grade: seed?.grade ?? '일반',
    iconUrl: seed?.icon ?? null,
  }
}

function notification(
  id: number,
  alertId: number,
  itemId: number,
  price: number,
  direction: AlertDirection,
  threshold: number,
  dm: Notification['dm'],
  web: boolean,
  createdAt: string,
): Notification {
  return {
    id,
    alertId,
    item: itemOf(itemId),
    price,
    direction,
    threshold,
    dm,
    web,
    createdAt,
  }
}

function load(): AlertsState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? (JSON.parse(saved) as AlertsState) : seedState()
  } catch {
    return seedState()
  }
}

function save(state: AlertsState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function toAlert(stored: StoredAlert): Alert {
  const { itemId, ...rest } = stored
  return {
    ...rest,
    item: {
      ...itemOf(itemId),
      currentPrice: findSeed(itemId)?.currentPrice ?? null,
    },
  }
}

export class AlertLimitError extends Error {}

export const mockAlerts = {
  activeCount: () => load().alerts.filter((a) => a.status === 'ACTIVE').length,

  list({
    status,
    itemId,
  }: {
    status?: AlertStatus
    itemId?: number
  }): AlertList {
    const all = load().alerts.filter(
      (a) => itemId === undefined || a.itemId === itemId,
    )
    const count = (s: AlertStatus) => all.filter((a) => a.status === s).length
    return {
      items: all.filter((a) => !status || a.status === status).map(toAlert),
      counts: {
        all: all.length,
        active: count('ACTIVE'),
        paused: count('PAUSED'),
        triggered: count('TRIGGERED'),
      },
      activeLimit: ACTIVE_ALERT_LIMIT,
    }
  },

  find: (id: number) => load().alerts.find((a) => a.id === id),

  /** 새 알림은 활성으로 시작한다. 활성이 한도면 AlertLimitError */
  create(request: AlertRequest): Alert {
    if (this.activeCount() >= ACTIVE_ALERT_LIMIT) throw new AlertLimitError()
    const state = load()
    const stored: StoredAlert = {
      ...alert(
        state.nextId,
        request.itemId,
        request.direction,
        request.threshold,
        request.channels,
        'ACTIVE',
        new Date().toISOString(),
      ),
    }
    save({
      ...state,
      nextId: state.nextId + 1,
      alerts: [stored, ...state.alerts],
    })
    return toAlert(stored)
  },

  /** 조건, 기준가, 받을 곳을 바꾼다. 상태는 그대로 둔다 */
  update(id: number, request: AlertRequest): Alert {
    return this.patch(id, {
      direction: request.direction,
      threshold: request.threshold,
      channels: request.channels,
    })
  },

  /** 다시 켜면 활성이 되고 발송 시각을 지운다. 활성이 한도면 AlertLimitError */
  setStatus(id: number, status: AlertStatus): Alert {
    if (status === 'ACTIVE' && this.activeCount() >= ACTIVE_ALERT_LIMIT) {
      throw new AlertLimitError()
    }
    return this.patch(id, {
      status,
      ...(status === 'ACTIVE' && { triggeredAt: null }),
    })
  },

  patch(id: number, patch: Partial<StoredAlert>): Alert {
    const state = load()
    const alerts = state.alerts.map((a) =>
      a.id === id ? { ...a, ...patch } : a,
    )
    save({ ...state, alerts })
    return toAlert(alerts.find((a) => a.id === id)!)
  },

  remove(id: number) {
    const state = load()
    save({ ...state, alerts: state.alerts.filter((a) => a.id !== id) })
  },

  notifications: () => load().notifications,

  /**
   * 웹으로 받는 활성 알림 하나가 조건을 만족한 것처럼 발송한다 (SSE 목업용).
   * 알림은 '발송 완료'가 되고 받은 알림 내역에 남는다. 보낼 알림이 없으면 null.
   */
  triggerOne(): Notification | null {
    const state = load()
    const target = state.alerts.find(
      (a) => a.status === 'ACTIVE' && a.channels.web,
    )
    if (!target) return null
    const now = new Date().toISOString()
    const price =
      target.direction === 'BELOW' ? target.threshold - 1 : target.threshold + 1
    const sent = notification(
      Math.max(0, ...state.notifications.map((n) => n.id)) + 1,
      target.id,
      target.itemId,
      price,
      target.direction,
      target.threshold,
      target.channels.dm ? 'SENT' : null,
      true,
      now,
    )
    save({
      ...state,
      alerts: state.alerts.map((a) =>
        a.id === target.id
          ? { ...a, status: 'TRIGGERED', triggeredAt: now }
          : a,
      ),
      notifications: [sent, ...state.notifications],
    })
    return sent
  },

  reset() {
    localStorage.removeItem(STORAGE_KEY)
  },
}
