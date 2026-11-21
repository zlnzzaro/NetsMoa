// 목록(피드)에 한 줄로 보이는 모집글 하나.
import { Link, useNavigate } from 'react-router-dom'
import Avatar from '../common/Avatar'
import SeatsLine from './SeatsLine'
import SkillChips from '../common/SkillChips'
import { categoryLabel, filledTotalOf, isOpen, pad2, timeAgo, totalOf } from '../../utils/post'

export default function PostItem({ post, index }) {
  const navigate = useNavigate()
  const left = totalOf(post) - filledTotalOf(post)
  return (
    // 글 아무 데나 눌러도 상세로 가요 (안쪽 링크를 누른 경우는 제외)
    <article className="post" onClick={(e) => { if (!e.target.closest('a')) navigate(`/posts/${post.id}`) }}>
      <span className="idx" style={{ paddingTop: 3 }}>{pad2(index + 1)}</span>
      <div className="body">
        <div className="meta">
          <Avatar user={post.author} size="s" />
          <span className="who">{post.author.nickname}</span>
          <span>{timeAgo(post.createdAt)}</span>
          <span className="tag">{categoryLabel(post.category)}</span>
          <span className="spacer" />
          {isOpen(post) ? <span>{left}자리 남음</span> : <span className="tag off">모집 마감</span>}
        </div>
        <h3>{post.title}</h3>
        <p className="sum">{post.description.split('\n')[0]}</p>
        <SeatsLine post={post} />
        <div className="foot">
          <SkillChips skills={post.techStack} />
          <Link className="btn s" to={`/posts/${post.id}`}>자세히 보기</Link>
        </div>
      </div>
    </article>
  )
}
