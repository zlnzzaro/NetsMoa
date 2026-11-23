// 왼쪽 아래 떠 있는 "시연 순서" 바. 발표할 때 이 순서대로 누르면 핵심 흐름을 보여 줄 수 있어요.
// 시연이 끝나면 App.jsx 에서 <DemoBar /> 한 줄만 지우면 돼요.
import { NavLink, useMatch } from 'react-router-dom'
import { pad2 } from '../../utils/post'
import { DEMO_POST_ID } from '../../lib/supabase'

export default function DemoBar() {
  // 지금 보고 있는 모집글 id (없으면 시연용 대표 글)
  const m = useMatch('/posts/:id/*')
  const id = m?.params.id ?? DEMO_POST_ID
  const steps = [
    ['/', '목록'],
    [`/posts/${id}`, '지원'],
    [`/posts/${id}/manage`, '면담·확정'],
    [`/posts/${id}/team`, '팀 채팅'],
  ]
  return (
    <div className="demo" aria-label="시연 순서">
      <b>시연</b>
      {steps.map(([to, label], i) => (
        <NavLink key={label} to={to} end className={({ isActive }) => (isActive ? 'on' : '')}>
          <span>{pad2(i + 1)}</span>{label}
        </NavLink>
      ))}
    </div>
  )
}
