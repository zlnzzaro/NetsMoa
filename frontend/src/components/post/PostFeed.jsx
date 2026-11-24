
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

  const setCategory = (value) => {
    setShown(PAGE)
    setParams(
      value === 'ALL' ? {} : { category: value },
      { replace: true, preventScrollReset: true }
    )
  }

  const keyword = q.trim().toLowerCase()

  const list = posts.filter((post) =>
    (category === 'ALL' || post.category === category) &&
    (role === 'ALL' || post.roles.some(
      (item) =>
        item.roleCode === role &&
        item.members.length < item.capacity
    )) &&
    (!keyword ||
      `${post.title} ${post.techStack.join(' ')} ${post.description}`
        .toLowerCase()
        .includes(keyword))
  )

  return (
    <section className="frame" id="feed">
      <div className="sec-title feed-title">
        <h2 className="heading">모집 게시판</h2>
        <span className="cap">
          함께 프로젝트를 만들어 갈 팀을 찾아보세요.
        </span>
      </div>

      <div className="feedwrap board-feed">
        <div className="board-toolbar">
          <label className="search board-search">
            <Icon name="search" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setShown(PAGE)
              }}
              placeholder="제목이나 기술 스택으로 검색"
            />
            {q && (
              <button
                type="button"
                className="board-search-clear"
                aria-label="검색어 지우기"
                onClick={() => {
                  setQ('')
                  setShown(PAGE)
                }}
              >
                ×
              </button>
            )}
          </label>

          <select
            className="sel board-role-select"
            aria-label="역할 필터"
            value={role}
            onChange={(e) => {
              setRole(e.target.value)
              setShown(PAGE)
            }}
          >
            <option value="ALL">전체 역할</option>
            {Object.entries(ROLE).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="board-category">
          {[['ALL', '전체'], ...Object.entries(CATEGORY)].map(
            ([code, label]) => (
              <button
                key={code}
                type="button"
                className={category === code ? 'active' : ''}
                onClick={() => setCategory(code)}
              >
                {label}
              </button>
            )
          )}
        </div>

        <div className="board-list-heading">
          <span>모집글</span>
          <span>{list.length}개의 게시글</span>
        </div>

        {list.length === 0 ? (
          <div className="empty board-empty">
            검색 결과가 없습니다.
            <p>검색어나 필터 조건을 변경해 보세요.</p>
          </div>
        ) : (
          <>
            <div className="board-list">
              {list.slice(0, shown).map((post, index) => (
                <PostItem
                  key={post.id}
                  post={post}
                  index={index}
                />
              ))}
            </div>

            {list.length > shown && (
              <div className="more board-more">
                <button
                  className="btn s"
                  type="button"
                  onClick={() => setShown((prev) => prev + PAGE)}
                >
                  더 보기
                  <span>({list.length - shown})</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
