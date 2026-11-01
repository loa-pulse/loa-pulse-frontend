import { createContext, useContext } from 'react'
import type { LoginPromptOptions } from './components/login-dialog'

export type LoginPrompt = (options?: LoginPromptOptions) => void

export const LoginPromptContext = createContext<LoginPrompt | null>(null)

/** Provider 밖(화면 단위 테스트)에서는 아무 일도 하지 않는다 */
const noop: LoginPrompt = () => {}

/** 로그인 안내 모달을 연다. 로그인이 필요한 동작(알림 설정, 관심 등록) 앞에서 쓴다 */
export function useLoginPrompt(): LoginPrompt {
  return useContext(LoginPromptContext) ?? noop
}
