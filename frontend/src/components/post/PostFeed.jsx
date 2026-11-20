// 모집글 목록 + 검색 + 분류 탭 + 역할 필터 + "더 보기"(10개씩).
// 분류는 주소(?category=STUDY)에 저장해서, 아래 푸터 링크로도 바로 거를 수 있어요.
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Icon from '../common/Icon'
import PostItem from './PostItem'
import { CATEGORY, ROLE } from '../../constants/codes'

const PAGE = 10

export default function PostFeed({ posts }) {
  const [params, setParams] = useSearchParams()
  const category = params.get('category') ?? 'ALL'
  const [q, setQ] = useState('')
  const [role, setRole] = useState('ALL')
  const [shown, setShown] = useState(PAGE)

  const setCategory = (c) => {
    setShown(PAGE)
    setParams(c === 'ALL' ? {} : { category: c }, { replace: true, preventScrollReset: true })
  }

  const keyword = q.trim().toLowerCase()
  const list = posts.filter((p) =>
    (category === 'ALL' || p.category === category) &&
    (role === 'ALL' || p.roles.some((r) => r.roleCode === role && r.members.length < r.capacity)) &&
    (!keyword || `${p.title} ${p.techStack.join(' ')} ${p.description}`.toLowerCase().includes(keyword)))

  return (
    <section className="frame" id="feed">
      <div className="sec-title feed-title">
        <h2 className="heading">모집 중인 팀</h2>
        <span className="cap">마음에 드는 글에서 역할을 골라 지원하세요</span>
      </div>
      <div className="feedwrap">
        <div className="tools">
          <label className="search">
            <Icon name="search" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setShown(PAGE) }} placeholder="제목, 기술스택으로 검색" />
          </label>
          <select className="sel" aria-label="비어 있는 역할" value={role} onChange={(e) => { setRole(e.target.value); setShown(PAGE) }}>
            <option value="ALL">역할 전체</option>
            {Object.entries(ROLE).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
          </select>
        </div>

        <div className="tabs">
          {[['ALL', '전체'], ...Object.entries(CATEGORY)].map(([code, label]) => (
            <button key={code} className={category === code ? 'on' : ''} onClick={() => setCategory(code)}>{label}</button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="empty">조건에 맞는 모집글이 없어요. 검색어나 분류를 바꿔 보세요.</div>
        ) : (
          <>
            <div>{list.slice(0, shown).map((p, i) => <PostItem key={p.id} post={p} index={i} />)}</div>
            {list.length > shown && (
              <div className="more">
                <button className="btn s" onClick={() => setShown(shown + PAGE)}>더 보기 ({list.length - shown})</button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
