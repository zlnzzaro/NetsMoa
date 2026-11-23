// 작성자 화면: 지원자 관리 (주소: /posts/:id/manage)
// 역할마다 지원자 목록 → 면담하기 / 합류 확정 / 선발 종료 / 되돌리기
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Icon from '../components/common/Icon'
import ApplicantRow from '../components/application/ApplicantRow'
import ChatDrawer from '../components/application/ChatDrawer'
import useLoad from '../hooks/useLoad'
import { getPost } from '../api/posts'
import { accept, reject, startChat, undo } from '../api/applications'
import { pad2, roleLabel } from '../utils/post'
import { useToast } from '../context/ToastContext'
import { useMe } from '../context/MeContext'
import { isDemoMode } from '../lib/supabase'
import NotFound from './NotFound'

export default function ManagePage() {
  const { id } = useParams()
  const toast = useToast()
  const { me, isGuest } = useMe()
  const { data: post, error, reload } = useLoad(() => getPost(id), [id, me.id])
  const [chat, setChat] = useState(null)

  if (error) return <NotFound />
  if (!post) return null

  // 지원자 정보는 작성자만 볼 수 있어요 (체험 모드는 시연을 위해 누구나)
  if (post.authorId !== me.id && !isDemoMode) {
    return (
      <div className="frame page">
        <Link className="back" to={`/posts/${post.id}`}><Icon name="left" />모집글</Link>
        <div className="intro">
          <h1 className="display">작성자만 볼 수 있는 화면이에요</h1>
          <p className="statement">{post.title} · 작성자 {post.author.nickname}님이 지원자를 관리하는 곳이에요.</p>
          <div className="pair">
            {isGuest
              ? <Link className="btn p" to={`/login?next=/posts/${post.id}/manage`}>로그인</Link>
              : <Link className="btn s" to="/mine">내 모집글 보기</Link>}
          </div>
        </div>
      </div>
    )
  }

  const count = post.roles.reduce((sum, r) => sum + r.applications.length, 0)
  const closed = post.status === 'CLOSED'

  // 지원자 줄에서 누른 버튼 처리
  const onAction = async (type, app, role) => {
    const name = app.applicant.nickname
    try {
      if (type === 'chat') { await startChat(app.id, post.authorId); reload(); setChat({ app: { ...app, status: 'CHATTING' }, role }) }
      if (type === 'openChat') setChat({ app, role })
      if (type === 'accept') { const notice = await accept(app.id); toast(notice === '합류를 확정했어요' ? `${name}님 합류를 확정했어요` : notice) }
      if (type === 'reject') { await reject(app.id); toast(`${name}님은 선발 종료로 바뀌었어요`) }
      if (type === 'undo') { await undo(app.id); toast('검토 대기로 되돌렸어요') }
    } catch (err) {
      toast(err.message)
    }
    reload()
  }

  return (
    <div className="frame page" style={{ paddingBottom: 80 }}>
      <Link className="back" to={`/posts/${post.id}`}><Icon name="left" />모집글</Link>
      <div className="intro">
        <h1 className="display">지원한 사람과 먼저 이야기해요</h1>
        <p className="statement">작성자 {post.author.nickname}님 화면 · {post.title} · 지원 {count}건</p>
      </div>

      <div className="notice">
        {closed && <i className="glow" style={{ background: '#0052ff', opacity: 0.8 }} />}
        {closed
          ? <><b>모집 마감.</b> 정원이 다 차서 모집이 자동으로 마감됐어요. 남은 지원자는 선발 종료로 바뀌었어요.</>
          : <><b>면담 후 합류를 확정하세요.</b> 역할 정원이 차면 남은 지원자는 자동으로 선발 종료돼요.</>}
      </div>

      {post.roles.map((r, i) => (
        <section className="mg" key={r.id}>
          <div className="head">
            <span className="idx">{pad2(i + 1)}</span>
            <h2>{roleLabel(r, post)}</h2>
            <span className="cap">{r.members.length}/{r.capacity}명 · {r.applications.length}명 지원</span>
          </div>
          {r.applications.length === 0
            ? <p className="cap none">아직 이 역할에 지원한 사람이 없어요.</p>
            : r.applications.map((a) => (
              <ApplicantRow key={a.id} application={a} roleFull={r.members.length >= r.capacity}
                onAction={(type, app) => onAction(type, app, r)} />
            ))}
        </section>
      ))}

      {chat && (
        <ChatDrawer application={chat.app} roleName={roleLabel(chat.role, post)}
          viewer={post.author} other={chat.app.applicant} viewerIsAuthor onClose={() => { setChat(null); reload() }} />
      )}
    </div>
  )
}
