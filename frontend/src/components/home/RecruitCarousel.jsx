// "현재 모집 현황": 모집 중인 글을 카드로 띄워 옆으로 넘겨 보는 줄.
// 넘기는 법: 화살표 버튼 / 옆 카드 클릭 / 마우스로 끌기 / 폰에서는 손가락으로 밀기.
// 가운데 카드를 한 번 더 누르면 상세 화면으로 가요.
// 숫자 4개(모집 중인 팀, 빈 자리, 내 스택과 맞는 자리, 내가 지원한 팀)는 우측 하단에 작게.
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Avatar from '../common/Avatar'
import Icon from '../common/Icon'
import { categoryLabel, filledTotalOf, isMatch, isOpen, pad2, percentOf, roleLabel, shortDate, timeAgo, totalOf } from '../../utils/post'
import { useMe } from '../../context/MeContext'

// 카드 뒤 흐릿한 색 [진한 색, 밝은 색, 결 각도]
const WASH = [
  ['#2f9e5a', '#c9f0a8', 118], ['#00a2c7', '#bfe9ff', 150], ['#e7799b', '#ffd9e6', 100],
  ['#8a6cf0', '#e2d9ff', 135], ['#e0a43a', '#ffecc2', 112], ['#0052ff', '#cfe0ff', 128],
]

function Card({ post, index, active, onSelect }) {
  const { me } = useMe()
  const [c1, c2, ang] = WASH[index % WASH.length]
  const left = totalOf(post) - filledTotalOf(post)
  const matched = post.roles.some((r) => isMatch(r, me.skills) && r.members.length < r.capacity)
  return (
    <article className={`sc-card ${active ? 'on' : ''}`} onClick={(e) => onSelect(index, e)}>
      <p className="sc-label">{categoryLabel(post.category)} · {shortDate(post.deadline)} 마감</p>
      <div className="sc-stage" style={{ '--c1': c1, '--c2': c2, '--ang': `${ang}deg` }}>
        <span className="tex" />
        <div className="sc-pane">
          <div className="meta">
            <Avatar user={post.author} size="s" />
            <span className="who">{post.author.nickname}</span>
            <span>{timeAgo(post.createdAt)}</span>
          </div>
          <h3>{post.title}</h3>
          <div className="sc-roles">
            {post.roles.map((r) => (
              <div className="sc-role" key={r.id}>
                <span>{roleLabel(r, post)}</span>
                <span className="dots">
                  {Array.from({ length: r.capacity }, (_, k) => <i key={k} className={k < r.members.length ? '' : 'e'} />)}
                </span>
                <span className="cap">{r.members.length}/{r.capacity}</span>
              </div>
            ))}
          </div>
          <div className="bar"><i style={{ width: `${percentOf(post)}%` }} /></div>
          <div className="sc-bottom">
            <span className="cap">{left}자리 남음{matched && <> · <b className="mt">내 스택 매칭</b></>}</span>
            <Link className="btn p" to={`/posts/${post.id}`}>지원하러 가기</Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function RecruitCarousel({ posts }) {
  const { me } = useMe()
  const navigate = useNavigate()
  const track = useRef(null)
  const drag = useRef(null) // 마우스로 끄는 중일 때 시작 위치
  const moved = useRef(false) // 끌기였는지(클릭과 구분)
  const open = posts.filter(isOpen)
  // 지금 가운데 있는 카드 번호. 처음엔 두 번째 카드라서 양옆에 카드가 보여요.
  const [cur, setCur] = useState(Math.min(1, open.length - 1))

  // 숫자 4개
  const seats = open.reduce((sum, p) => sum + totalOf(p) - filledTotalOf(p), 0)
  const matchSeats = open.reduce((sum, p) => sum + p.roles.filter((r) => isMatch(r, me.skills))
    .reduce((s, r) => s + Math.max(0, r.capacity - r.members.length), 0), 0)
  const applied = posts.filter((p) => p.roles.some((r) =>
    r.applications.some((a) => a.applicantId === me.id && a.status !== 'CANCELED'))).length

  // i번째 카드를 가운데로
  const centerTo = (i, smooth = true) => {
    const tr = track.current
    const el = tr.children[Math.max(0, Math.min(open.length - 1, i))]
    if (!el) return
    tr.scrollTo({ left: el.offsetLeft - (tr.clientWidth - el.offsetWidth) / 2, behavior: smooth ? 'smooth' : 'auto' })
  }

  // 가운데에 가장 가까운 카드 번호
  const nearest = () => {
    const tr = track.current
    const mid = tr.scrollLeft + tr.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    ;[...tr.children].forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid)
      if (d < bestDist) { bestDist = d; best = i }
    })
    return best
  }
  const onScroll = () => setCur(nearest())

  // 처음 그릴 때 cur 번째 카드를 가운데로 (애니메이션 없이)
  useEffect(() => {
    centerTo(cur, false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 마우스로 끌어서 넘기기
  useEffect(() => {
    const onMove = (e) => {
      if (!drag.current) return
      const dx = e.clientX - drag.current.x
      if (Math.abs(dx) > 4 && !moved.current) {
        moved.current = true
        track.current.classList.add('dragging')
      }
      if (moved.current) track.current.scrollLeft = drag.current.left - dx
    }
    const onUp = () => {
      if (!drag.current) return
      drag.current = null
      track.current.classList.remove('dragging')
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  // 끌기가 끝나면 가장 가까운 카드로 붙여요
  const onPointerUpTrack = () => { if (moved.current) centerTo(nearest()) }
  const onSelect = (i, e) => {
    if (moved.current) { e.preventDefault(); moved.current = false; return }
    if (i !== cur) { e.preventDefault(); centerTo(i) } // 옆 카드 → 가운데로
    else if (!e.target.closest('a')) navigate(`/posts/${open[i].id}`) // 가운데 카드 → 상세
  }

  return (
    <section className="showcase">
      <div className="frame sec-title">
        <h2 className="heading">현재 모집 현황</h2>
        <div className="sc-nav">
          <span className="cap">{pad2(cur + 1)} / {pad2(open.length)}</span>
          <button className="btn s sq" aria-label="이전 모집글" onClick={() => centerTo(cur - 1)}><Icon name="left" /></button>
          <button className="btn s sq" aria-label="다음 모집글" onClick={() => centerTo(cur + 1)}><Icon name="right" /></button>
        </div>
      </div>

      <div className="sc-track" ref={track}
        onScroll={() => requestAnimationFrame(onScroll)}
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse') return // 터치는 브라우저 기본 스크롤로
          drag.current = { x: e.clientX, left: track.current.scrollLeft }
          moved.current = false
        }}
        onPointerUp={onPointerUpTrack}>
        {open.map((p, i) => <Card key={p.id} post={p} index={i} active={i === cur} onSelect={onSelect} />)}
      </div>

      <div className="frame sc-foot">
        <span className="cap">카드를 누르거나 옆으로 끌어서 넘겨 보세요</span>
        <dl className="sc-stats" aria-label="모집 현황 숫자">
          <div><dt>모집 중인 팀</dt><dd>{open.length}팀</dd></div>
          <div><dt>빈 자리</dt><dd>{seats}자리</dd></div>
          <div><dt>내 스택과 맞는 자리</dt><dd>{matchSeats}자리</dd></div>
          <div><dt>내가 지원한 팀</dt><dd>{applied}팀</dd></div>
        </dl>
      </div>
    </section>
  )
}
