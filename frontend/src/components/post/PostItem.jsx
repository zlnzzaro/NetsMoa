
import { Link, useNavigate } from 'react-router-dom'
import Avatar from '../common/Avatar'
import SeatsLine from './SeatsLine'
import SkillChips from '../common/SkillChips'
import {
  categoryLabel,
  filledTotalOf,
  isOpen,
  timeAgo,
  totalOf,
} from '../../utils/post'

export default function PostItem({ post }) {
  const navigate = useNavigate()
  const left = totalOf(post) - filledTotalOf(post)
  const open = isOpen(post)

  return (
    <article
      className="post board-post"
      onClick={(e) => {
        if (!e.target.closest('a, button')) {
          navigate(`/posts/${post.id}`)
        }
      }}
    >
      <div className="board-post-header">
        <div className="board-author">
          <Avatar user={post.author} size="s" />
          <span className="who">{post.author.nickname}</span>
          <span className="board-separator">·</span>
          <span>{timeAgo(post.createdAt)}</span>
        </div>

        <span className="board-category-label">
          {categoryLabel(post.category)}
        </span>
      </div>

      <div className="board-post-main">
        <h3>{post.title}</h3>
        <p className="sum">
          {post.description.split('\n')[0]}
        </p>
      </div>

      <div className="board-post-info">
        <div className="board-post-roles">
          <span className="board-info-title">모집 역할</span>
          <SeatsLine post={post} />
        </div>

        <div className="board-post-skills">
          <SkillChips skills={post.techStack} />
        </div>
      </div>

      <div className="board-post-footer">
        <span className={open ? 'board-status' : 'board-status closed'}>
          {open ? `모집 중 · ${left}자리 남음` : '모집 마감'}
        </span>

        <Link to={`/posts/${post.id}`} className="board-detail">
          자세히 보기 <span>→</span>
        </Link>
      </div>
    </article>
  )
}
