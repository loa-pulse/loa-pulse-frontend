/**
 * API가 401(로그인 필요)을 돌려준 것을 화면에 알리는 통로.
 * QueryClient는 React 밖에서 만들어지므로 이벤트로 로그인 안내 모달까지 전달한다 (08-frontend-plan 3-4).
 */
type Listener = () => void

const listeners = new Set<Listener>()

export function onUnauthorized(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function notifyUnauthorized() {
  listeners.forEach((listener) => listener())
}
