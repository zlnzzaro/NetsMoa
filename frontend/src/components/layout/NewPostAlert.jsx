// 오른쪽 아래에 떠오르는 "새 모집글" 알림.
// 다른 사람이 글을 올렸을 때, 그 글의 기술스택(글 전체 + 역할별)이 내 기술스택과 하나라도 겹치면 보여 줘요.
// 로그인 전이거나 내 기술스택이 비어 있으면 아무것도 안 해요.
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../common/Icon'
import { useMe } from '../../context/MeContext'
import { subscribeNewPosts } from '../../api/posts'
import { isDemoMode } from '../../lib/supabase'
import { categoryLabel } from '../../utils/post'

const SHOW_MS = 10000 // 알림이 떠 있는 시간
const MAX = 3 // 한 번에 쌓아 두는 알림 수

// 글에서 원하는 기술 중 내 기술스택과 겹치는 것 (대소문자 무시, 글에 적힌 순서대로)
function matchedSkills(post, mySkills) {
  const mine = new Set(mySkills.map((s) => s.toLowerCase()))
  const wanted = [...post.techStack, ...post.roles.flatMap((r) => r.skills)]
  const seen = new Set()
  return wanted.filter((s) => {
    const k = s.toLowerCase()
    if (!mine.has(k) || seen.has(k)) return false
    seen.add(k)
    return true
  })
}

export default function NewPostAlert() {
  const { me, isGuest } = useMe()
  const [alerts, setAlerts] = useState([]) // [{ post, skills }]
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setAlerts((list) => list.filter((a) => a.post.id !== id))
  }, [])

  // 마우스를 올려 두면 사라지지 않게 멈추고, 떼면 다시 세요
  const hold = (id) => clearTimeout(timers.current.get(id))
  const release = (id) => timers.current.set(id, setTimeout(() => dismiss(id), SHOW_MS))

  const myId = me.id
  const mySkillsKey = me.skills.join('\u0000')

  useEffect(() => {
    if (isGuest || !mySkillsKey) return
    const mySkills = mySkillsKey.split('\u0000')
    const stop = subscribeNewPosts((post) => {
      // 내가 쓴 글은 빼요 (체험 모드는 글쓴이가 항상 나라서, 시연용으로 그대로 보여 줘요)
      if (!isDemoMode && post.authorId === myId) return
      if (post.status !== 'OPEN') return
      const skills = matchedSkills(post, mySkills)
      if (skills.length === 0) return
      setAlerts((list) => [{ post, skills }, ...list.filter((a) => a.post.id !== post.id)].slice(0, MAX))
      clearTimeout(timers.current.get(post.id))
      timers.current.set(post.id, setTimeout(() => dismiss(post.id), SHOW_MS))
    })
    return stop
  }, [isGuest, myId, mySkillsKey, dismiss])

  // 화면을 떠날 때 타이머 정리
  useEffect(() => {
    const map = timers.current
    return () => map.forEach(clearTimeout)
  }, [])

  if (alerts.length === 0) return null
  return (
    <section className="np-stack" aria-live="polite" aria-label="새 모집글 알림">
      {alerts.map(({ post, skills }) => (
        <article
          key={post.id}
          className="np-card"
          onMouseEnter={() => hold(post.id)}
          onMouseLeave={() => release(post.id)}
          onFocus={() => hold(post.id)}
          onBlur={() => release(post.id)}
        >
          <div className="np-head">
            <span className="cap"><b className="np-dot" aria-hidden="true" />내 스택과 맞는 새 글 · {categoryLabel(post.category)}</span>
            <button type="button" className="np-x" onClick={() => dismiss(post.id)} aria-label="알림 닫기">
              <Icon name="x" size={14} />
            </button>
          </div>
          <p className="np-title">{post.title}</p>
          <ul className="chips" aria-label="겹치는 기술">
            {skills.map((s) => <li key={s} className="chip hit">{s}</li>)}
          </ul>
          <Link to={`/posts/${post.id}`} className="btn p np-go" onClick={() => dismiss(post.id)}>
            보러 가기 <Icon name="right" size={14} />
          </Link>
        </article>
      ))}
    </section>
  )
}
