// 내 활동 (주소: /mine). 내가 쓴 모집글 / 내 지원 현황 / 합류한 팀을 한곳에 모아 보여 줘요.
import { useEffect } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import Icon from '../components/common/Icon'
import StatusBadge from '../components/common/StatusBadge'
import useLoad from '../hooks/useLoad'
import { getPosts } from '../api/posts'
import { categoryLabel, filledTotalOf, roleLabel, shortDate, totalOf } from '../utils/post'
import { useMe } from '../context/MeContext'

function Section({ id, title, cap, children, empty }) {
  return (
    <section className="mg" id={id} style={{ scrollMarginTop: 90 }}>
      <div className="head"><h2>{title}</h2><span className="cap">{cap}</span></div>
      {children.length === 0 ? <p className="cap none">{empty}</p> : children}
    </section>
  )
}

function Row({ to, title, meta, right }) {
  return (
    <div className="ap" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
      <div style={{ minWidth: 0 }}>
        <div className="nm"><Link to={to}>{title}</Link></div>
        <p className="cap">{meta}</p>
      </div>
      <div className="acts">{right}</div>
    </div>
  )
}

export default function MinePage() {
  const { me, isGuest } = useMe()
  const { hash } = useLocation()
  const { data: posts } = useLoad(getPosts, [me.id])

  // /mine#teams 처럼 들어오면 그 칸으로 스크롤
  useEffect(() => {
    if (posts && hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  }, [posts, hash])

  if (isGuest) return <Navigate to="/login?next=/mine" replace />

  const mine = (posts || []).filter((p) => p.authorId === me.id)
  const applied = (posts || []).flatMap((p) => p.roles.flatMap((r) =>
    r.applications.filter((a) => a.applicantId === me.id && a.status !== 'ACCEPTED').map((a) => ({ post: p, role: r, app: a }))))
  const teams = (posts || []).filter((p) => p.isMember)

  return (
    <div className="frame page" style={{ paddingBottom: 80 }}>
      <Link className="back" to="/"><Icon name="left" />홈</Link>
      <div className="intro">
        <h1 className="display">내 활동</h1>
        <p className="statement">{me.nickname}님이 쓴 모집글, 지원한 역할, 합류한 팀이에요.</p>
      </div>

      {!posts ? <p className="empty">불러오는 중이에요</p> : (
        <>
          <Section id="posts" title="내 모집글" cap={`${mine.length}개`} empty={<>아직 쓴 모집글이 없어요. <Link to="/write">모집글 쓰기</Link></>}>
            {mine.map((p) => {
              const waiting = p.roles.reduce((n, r) => n + r.applications.filter((a) => ['PENDING', 'CHATTING'].includes(a.status)).length, 0)
              return (
                <Row key={p.id} to={`/posts/${p.id}`} title={p.title}
                  meta={`${categoryLabel(p.category)} · ${filledTotalOf(p)}/${totalOf(p)}명 · ${p.status === 'CLOSED' ? '모집 마감' : `${shortDate(p.deadline)} 마감`} · 결정 기다리는 지원 ${waiting}건`}
                  right={<Link className="btn p" to={`/posts/${p.id}/manage`}>지원자 관리</Link>} />
              )
            })}
          </Section>

          <Section id="applied" title="내 지원 현황" cap={`${applied.length}건`} empty={<>아직 지원한 역할이 없어요. <Link to="/board">모집글 둘러보기</Link></>}>
            {applied.map(({ post, role, app }) => (
              <Row key={app.id} to={`/posts/${post.id}`} title={post.title}
                meta={`${roleLabel(role, post)} 역할 · 작성자 ${post.author.nickname}`}
                right={<><StatusBadge status={app.status} /><Link className="btn s" to={`/posts/${post.id}`}>보기</Link></>} />
            ))}
          </Section>

          <Section id="teams" title="내 팀" cap={`${teams.length}팀`} empty="합류가 확정되면 여기에 팀이 생겨요.">
            {teams.map((p) => (
              <Row key={p.id} to={`/posts/${p.id}/team`} title={p.title}
                meta={`${p.authorId === me.id ? '팀장' : '팀원'} · ${filledTotalOf(p)}/${totalOf(p)}명`}
                right={<Link className="btn p" to={`/posts/${p.id}/team`}>팀 화면</Link>} />
            ))}
          </Section>
        </>
      )}
    </div>
  )
}
