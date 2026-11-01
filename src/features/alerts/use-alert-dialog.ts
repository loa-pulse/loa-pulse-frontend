import { useState } from 'react'
import { useLocation, useSearchParams } from 'react-router'
import { useLoginPrompt } from '@/features/auth/login-prompt-context'
import { useAuth } from '@/features/auth/queries'

/** 로그인에서 돌아오면 알림 모달을 여는 표시 (`/items/1?alert=new`) */
const PARAM = 'alert'
const OPEN_VALUE = 'new'

/**
 * 아이템 상세의 알림 모달 열기 (흐름 1, 03-screens-flows).
 * 로그인했으면 바로 열고, 아니면 로그인 안내를 띄운다. 로그인하고 돌아오면 모달이 열린 채로 시작한다.
 */
export function useAlertDialog(itemName: string) {
  const { isLoggedIn } = useAuth()
  const promptLogin = useLoginPrompt()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [opened, setOpened] = useState(false)

  const returning = searchParams.get(PARAM) === OPEN_VALUE
  const open = opened || (returning && isLoggedIn)

  const setOpen = (next: boolean) => {
    setOpened(next)
    if (!next && returning) {
      setSearchParams(
        (params) => {
          params.delete(PARAM)
          return params
        },
        { replace: true },
      )
    }
  }

  const launch = () => {
    if (isLoggedIn) {
      setOpened(true)
      return
    }
    const params = new URLSearchParams(location.search)
    params.set(PARAM, OPEN_VALUE)
    promptLogin({
      returnTo: `${location.pathname}?${params}`,
      returnHint: `로그인하면 ${itemName} 화면으로 돌아와 알림 설정이 열려요`,
    })
  }

  return { open, setOpen, launch }
}
