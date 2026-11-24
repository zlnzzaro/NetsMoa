// 로그인이 필요한 동작 앞에 붙이는 도우미.
// 사용법: const gate = useLoginGate();  onClick={() => gate(() => setApplyRole(role))}
// 로그인 안 했으면 로그인 화면으로 보내고, 로그인하면 지금 화면으로 돌아와요.
import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMe } from '../context/MeContext'

export default function useLoginGate() {
  const { isGuest } = useMe()
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  return useCallback((fn) => {
    if (isGuest) navigate(`/login?next=${encodeURIComponent(pathname + search)}`)
    else fn()
  }, [isGuest, navigate, pathname, search])
}
