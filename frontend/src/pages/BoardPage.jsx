// 게시판 (주소: /board). 상단바의 '게시판'을 누르면 와요.
// 모집글만 모아서 검색·분류·역할로 걸러 볼 수 있어요. (?category=STUDY 처럼 분류를 주소로 넘길 수 있어요)
import PostFeed from '../components/post/PostFeed'
import useLoad from '../hooks/useLoad'
import { getPosts } from '../api/posts'

export default function BoardPage() {
  const { data: posts } = useLoad(getPosts, [])

  return (
    <div className="page">
      {posts ? <PostFeed posts={posts} /> : <p className="frame empty">모집글을 불러오는 중이에요</p>}
    </div>
  )
}
