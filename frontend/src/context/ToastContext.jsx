// 화면 아래에 잠깐 떴다 사라지는 안내 문구(토스트).
// 쓰는 법: const toast = useToast();  toast('지원했어요')
import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(() => {})

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null)
  const timer = useRef(null)

  const toast = useCallback((text) => {
    setMsg(text)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMsg(null), 2600)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {msg && <div className="toast" role="status">{msg}</div>}
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react/only-export-components
export const useToast = () => useContext(ToastContext)
