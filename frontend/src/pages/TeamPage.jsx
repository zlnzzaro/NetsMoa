// 팀 확정 화면 (주소: /posts/:id/team)
// 팀원 목록 + 팀 채팅방 링크. 링크는 합류가 확정된 사람에게만 보여요.
import { Link, useParams } from 'react-router-dom'
import Avatar from '../components/common/Avatar'
import Icon from '../components/common/Icon'
import Vignette from '../components/common/Vignette'
import useLoad from '../hooks/useLoad'
import { getPost } from '../api/posts'
import { filledTotalOf, pad2, roleLabel, totalOf } from '../utils/post'
import { useMe } from '../context/MeContext'
import { useToast } from '../context/ToastContext'
import NotFound from './NotFound'

export default function TeamPage() {
  const { id } = useParams()
  const { me } = useMe()
  const toast = useToast()
  const { data: post, error } = useLoad(() => getPost(id), [id])

  if (error) return <NotFound />
  if (!post) return null

  const members = post.roles.flatMap((r) => r.members.map((m) => ({ user: m, role: r })))
  const copy = () => navigator.clipboard.writeText(post.chatUrl)
    .then(() => toast('링크를 복사했어요'), () => toast('복사가 안 됐어요. 링크를 길게 눌러 복사해 주세요'))

  return (
    <div className="frame page">
      <Link className="back" to={`/posts/${post.id}`}><Icon name="left" />모집글</Link>
      <div className="team-top">
        <div className="intro" style={{ padding: 0 }}>
          <span className="cap">{post.isMember ? '합류 확정' : '아직 확정 전'}</span>
          <h1 className="display">
            {post.isMember ? <>팀이 생겼어요.<br />이제 같이 만들어요</> : '작성자가 합류를 확정하면 팀 정보가 열려요'}
          </h1>
          <p className="statement">{post.title} · 팀 완성도 {filledTotalOf(post)}/{totalOf(post)}명</p>
        </div>
        <Vignette kind="team" width={300} />
      </div>

      <div className="sec-title" style={{ paddingTop: 0 }}>
        <h2 className="heading">팀원</h2><span className="cap">합류가 확정된 사람만 보여요</span>
      </div>
      <div className="members">
        {members.map(({ user, role }, i) => (
          <div className="mem" key={user.id}>
            <div>
              <Avatar user={user.id === me.id ? me : user} size="l" />
              <h3>{user.nickname}</h3>
              <span className="cap">
                {roleLabel(role, post)}{user.id === post.authorId && ' · 팀장'}{user.id === me.id && ' · 나'}
              </span>
            </div>
            <span className="idx">{pad2(i + 1)}</span>
          </div>
        ))}
      </div>

      <div className="sec-title" style={{ paddingTop: 0 }}>
        <h2 className="heading">팀 채팅방</h2>
        <span className="cap">{post.isMember ? '팀원끼리 이야기하는 곳이에요' : '합류가 확정되면 링크가 열려요'}</span>
      </div>
      {post.isMember ? (
        <div className="chatlink">
          <code>{post.chatUrl}</code>
          <div className="pair">
            <a className="btn p" href={post.chatUrl} target="_blank" rel="noopener noreferrer">채팅방 열기</a>
            <button className="btn s" onClick={copy}>복사</button>
          </div>
        </div>
      ) : (
        <div className="locked">
          <span>작성자가 합류를 확정하면 채팅방 링크가 여기에 보여요.</span>
          <Link className="btn s" to={`/posts/${post.id}/manage`}>작성자 화면에서 확정해 보기</Link>
        </div>
      )}
    </div>
  )
}
