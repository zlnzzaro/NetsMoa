// 역할별 자리를 작은 네모로 보여 줘요. ■ = 찬 자리, □(점선) = 빈 자리
import { isMatch, isOpen, roleLabel } from '../../utils/post'
import { useMe } from '../../context/MeContext'

export default function SeatsLine({ post }) {
  const { me } = useMe()
  return (
    <div className="seats-line">
      {post.roles.map((r) => (
        <span className="sg" key={r.id}>
          {roleLabel(r, post)}
          <span className="dots">
            {Array.from({ length: r.capacity }, (_, i) => (
              <i key={i} className={i < r.members.length ? '' : 'e'} />
            ))}
          </span>
          {r.members.length < r.capacity && isMatch(r, me.skills) && isOpen(post) && <span className="tag m">매칭</span>}
        </span>
      ))}
    </div>
  )
}
