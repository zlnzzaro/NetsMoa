// 요소가 화면에 들어오면 shown 을 true 로 바꿔 주는 도우미 (스크롤 등장 애니메이션용).
// 사용법: const [ref, shown] = useReveal()  →  <section ref={ref} className={shown ? 'in' : ''}>
// - 한 번 나타나면 다시 숨기지 않아요 (관찰을 바로 끝내요).
// - "동작 줄이기" 설정이 켜져 있거나, 브라우저에 IntersectionObserver 가 없으면 처음부터 보여요.
import { useEffect, useRef, useState } from 'react'

// 애니메이션 없이 바로 보여 줘야 하는 경우
const showAtOnce = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)

export default function useReveal(threshold = 0.2) {
  const ref = useRef(null)
  const [shown, setShown] = useState(showAtOnce)

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShown(true)
        io.disconnect()
      }
    }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, shown])

  return [ref, shown]
}
