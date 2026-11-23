// 모집글 상세 (주소: /posts/:id)
// 왼쪽: 제목·소개·역할 목록(지원하기) / 오른쪽: 팀 완성도
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Avatar from '../components/common/Avatar'
import Icon from '../components/common/Icon'
import RoleRow from '../components/post/RoleRow'
import SkillChips from '../components/common/SkillChips'
import ApplyModal from '../components/application/ApplyModal'
import ChatDrawer from '../components/application/ChatDrawer'
import useLoad from '../hooks/useLoad'
import { getPost } from '../api/posts'
import { apply, cancel } from '../api/applications'
import { categoryLabel, filledTotalOf, isOpen, percentOf, roleLabel, shortDate, timeAgo, totalOf } from '../utils/post'
import { useMe } from '../context/MeContext'
import useLoginGate from '../hooks/useLoginGate'
import { isDemoMode } from '../lib/supabase'
import { useToast } from '../context/ToastContext'
import NotFound from './NotFound'

export default function PostDetailPage() {
  const { id } = useParams()
  const { me } = useMe()
  const toast = useToast()
  const gate = useLoginGate()
  const { data: post, error, reload } = useLoad(() => getPost(id), [id, me.id])
  const [applyRole, setApplyRole] = useState(null) // 지원 창을 연 역할
  const [chat, setChat] = useState(null) // 면담 채팅을 연 지원서

  if (error) return <NotFound />
  if (!post) return null

  const filled = filledTotalOf(post)
  const total = totalOf(post)
  const myStackHits = post.techStack.filter((s) => me.skills.includes(s)).length

  const isAuthor = post.authorId === me.id

  const onApply = async (intro) => {
    try {
      await apply(post.id, applyRole.id, intro)
      toast('지원했어요. 지금은 검토 대기 상태예요')
    } catch (err) {
      toast(err.message)
    }
    setApplyRole(null)
    reload()
  }
  const onCancel = async (app) => {
    try {
      await cancel(app.id)
      toast('지원을 취소했어요')
    } catch (err) {
      toast(err.message)
    }
    reload()
  }

  return (
    <div className="frame page">
      <Link className="back" to="/board"><Icon name="left" />목록</Link>
      <div className="split">
        <div>
          <div className="d-meta">
            <Avatar user={post.author} size="s" />
            <span className="ink">{post.author.nickname}</span>
            <span>{timeAgo(post.createdAt)}</span>
            <span className="tag">{categoryLabel(post.category)}</span>
            {!isOpen(post) && <span className="tag off">모집 마감</span>}
          </div>
          <h1 className="display d-title">{post.title}</h1>
          <p className="d-desc statement">{post.description}</p>
          {post.techStack.length > 0 && (
            <div className="d-stack">
              <SkillChips skills={post.techStack} highlight={me.skills} />
              {myStackHits > 0 && <span className="cap">진한 칩은 내 기술스택과 겹치는 기술이에요 ({myStackHits}개)</span>}
            </div>
          )}

          <div className="roles">
            <span className="cap">모집 역할 · 빈 자리는 점선이에요</span>
            {post.roles.map((r, i) => (
              <RoleRow key={r.id} post={post} role={r} index={i}
                onApply={(role) => gate(() => setApplyRole(role))} onCancel={onCancel} onChat={(app) => setChat({ app, role: r })} />
            ))}
          </div>
        </div>

        <aside className="side">
          <div className="sidepanel">
            <i className="glow" style={{ background: '#00a2c7' }} />
            <span className="cap">팀 완성도</span>
            <div>
              <span className="num">{filled}<small> / {total}명</small></span>
              <div className="bar"><i style={{ width: `${percentOf(post)}%` }} /></div>
            </div>
            <dl className="kv">
              <dt>모집 마감</dt><dd>{shortDate(post.deadline)}</dd>
              <dt>남은 자리</dt><dd>{total - filled}자리</dd>
              <dt>팀 채팅</dt><dd>합류 확정 후 공개</dd>
            </dl>
            <span className="idx">01</span>
          </div>
          <div className="pair">
            {(isAuthor || isDemoMode) && <Link className="btn s" to={`/posts/${post.id}/manage`}>지원자 관리</Link>}
            {(post.isMember || isDemoMode) && <Link className="btn s" to={`/posts/${post.id}/team`}>팀 화면</Link>}
          </div>
        </aside>
      </div>

      {applyRole && (
        <ApplyModal post={post} role={applyRole} onSubmit={onApply} onClose={() => setApplyRole(null)} />
      )}
      {chat && (
        <ChatDrawer application={chat.app} roleName={roleLabel(chat.role, post)}
          viewer={me} other={post.author} viewerIsAuthor={false} onClose={() => setChat(null)} />
      )}
    </div>
  )
}
