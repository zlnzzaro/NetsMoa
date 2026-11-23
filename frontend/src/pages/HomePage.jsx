// 첫 화면 (주소: /)
// 위에서부터: 큰 문구 → 설명 문단 → 세 단계 → 넘겨 보는 모집글 카드
// 모집글 전체 목록은 게시판(/board)에 있어요.
import HeroSection from '../components/home/HeroSection'
import RecruitCarousel from '../components/home/RecruitCarousel'
import StepRows from '../components/home/StepRows'
import useLoad from '../hooks/useLoad'
import { getPosts } from '../api/posts'

export default function HomePage() {
  const { data: posts } = useLoad(getPosts, [])

  return (
    <>
      <HeroSection />
      <section className="frame quiet">
        <p className="statement">
          <b>좋은 아이디어는 많아요. 그런데 같이 할 사람을 찾기가 어려워요.</b>{' '}
          단톡방 공지는 금방 묻히고, 누가 어떤 역할을 할 수 있는지 한눈에 보이지 않아요.
          NETogether는 필요한 역할과 빈자리를 먼저 보여 줘요.
        </p>
      </section>
      <StepRows />
      {posts && <RecruitCarousel posts={posts} />}
    </>
  )
}
