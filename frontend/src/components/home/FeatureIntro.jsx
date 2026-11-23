// 홈 기능 소개: 스크롤하면 섹션 4개가 하나씩 아래에서 올라오며 나타나요.
// 각 섹션: 한쪽에 제목·설명·버튼, 반대쪽에 화면 예시(Vignette). 섹션마다 좌우를 번갈아 놓아요.
// 나타나는 순서: 제목 → 설명 → 버튼 → 예시 (0.1초씩 늦게, index.css 의 .feat .rv)
import { Link } from 'react-router-dom'
import Vignette from '../common/Vignette'
import useReveal from '../../hooks/useReveal'

const FEATURES = [
  {
    title: '필요한 자리만 적으면 돼요', kind: 'seats',
    text: '역할마다 몇 자리가 필요한지만 적으면 모집글이 완성돼요.',
    link: ['모집글 쓰기', '/write'],
  },
  {
    title: '내가 할 자리를 골라 지원해요', kind: 'apply',
    text: '빈 자리를 고르고 한 줄 소개를 남기면 지원 끝. 내 스택과 맞는 자리는 따로 표시돼요.',
    link: ['팀 둘러보기', '/board'],
  },
  {
    title: '두 사람만 보는 대화로 정해요', kind: 'chat',
    text: '작성자와 지원자 둘만 보는 채팅에서 이야기해 보고 합류를 정해요.',
    link: ['내 모집글', '/posts/p-1/manage'],
  },
  {
    title: '자리가 다 차면 팀 채팅이 열려요', kind: 'full',
    text: '정원이 차면 모집이 알아서 닫히고, 팀원에게만 팀 채팅 링크가 보여요.',
    link: ['내 팀', '/posts/p-1/team'],
  },
]

// --i: 같은 섹션 안에서 몇 번째로 나타날지 (0부터, 0.1초씩 늦게)
const order = (i) => ({ '--i': i })

function Feature({ title, text, link, kind, flip }) {
  const [ref, shown] = useReveal()
  return (
    <section ref={ref} className={`frame feat${flip ? ' flip' : ''}${shown ? ' in' : ''}`}>
      <div className="feat-text">
        <h2 className="rv" style={order(0)}>{title}</h2>
        <p className="rv" style={order(1)}>{text}</p>
        <div className="rv" style={order(2)}>
          <Link className="btn p" to={link[1]}>{link[0]}</Link>
        </div>
      </div>
      <div className="feat-ex rv" style={order(3)} aria-hidden="true">
        <Vignette kind={kind} />
      </div>
    </section>
  )
}

export default function FeatureIntro() {
  return FEATURES.map((f, i) => <Feature key={f.kind} {...f} flip={i % 2 === 1} />)
}
