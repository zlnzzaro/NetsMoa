// api 함수를 불러서 결과를 화면 상태로 들고 있는 작은 도우미.
// 사용법: const { data, error, reload } = useLoad(() => getPost(id), [id])
// 지원·승인처럼 데이터가 바뀌는 동작을 한 뒤에는 reload() 를 불러 다시 가져와요.
import { useCallback, useEffect, useState } from 'react'

export default function useLoad(fn, deps) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true // 화면이 바뀐 뒤 늦게 도착한 결과는 버려요
    fn()
      .then((d) => { if (alive) { setData(d); setError(null) } })
      .catch((e) => { if (alive) setError(e) })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]) // deps 는 부르는 쪽에서 정해 줘요

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { data, error, reload }
}
