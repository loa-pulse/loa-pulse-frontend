import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { onUnauthorized } from '@/lib/auth-events'
import { LoginDialog, type LoginPromptOptions } from './components/login-dialog'
import { LoginPromptContext } from './login-prompt-context'
import { startLogin } from './login'
import { authKeys } from './queries'

/**
 * 로그인 안내 모달을 앱에 하나 둔다. 화면은 useLoginPrompt로 열고,
 * API가 401을 돌려주면(세션 만료 등) 로그아웃 상태로 바꾸고 자동으로 연다.
 */
export function LoginPromptProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<LoginPromptOptions>({})

  const prompt = useCallback((next: LoginPromptOptions = {}) => {
    setOptions(next)
    setOpen(true)
  }, [])

  useEffect(
    () =>
      onUnauthorized(() => {
        queryClient.setQueryData(authKeys.me, null)
        prompt({
          title: '다시 로그인해 주세요',
          description:
            '로그인이 만료됐어요.\n디스코드 계정으로 다시 로그인하면 이어서 할 수 있어요.',
        })
      }),
    [queryClient, prompt],
  )

  return (
    <LoginPromptContext.Provider value={prompt}>
      {children}
      <LoginDialog
        {...options}
        open={open}
        onOpenChange={setOpen}
        onLogin={() => startLogin(options.returnTo)}
      />
    </LoginPromptContext.Provider>
  )
}
