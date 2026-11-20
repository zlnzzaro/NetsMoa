// "팀이 되기까지, 세 단계" — 번호 + 설명 / 가운데 화면 조각 / 오른쪽 링크.
import { Link } from 'react-router-dom'
import Vignette from '../common/Vignette'

const STEPS = [
  {
    no: '01', title: '역할을 골라 지원해요', kind: 'apply',
    text: '비어 있는 역할을 고르고 한 줄 소개만 쓰면 돼요. 내 기술스택과 맞는 역할엔 매칭 표시가 붙어요.',
    links: [['지원 화면 →', '/posts/p-1'], ['모집글 둘러보기 →', '/#feed']],
  },
  {
    no: '02', title: '1:1로 먼저 이야기해요', kind: 'chat',
    text: '작성자가 면담을 요청하면 두 사람만 보는 채팅이 열려요. 서로 맞는지 확인하고 정해요.',
    links: [['면담 화면 →', '/posts/p-1/manage']],
  },
  {
    no: '03', title: '자리가 차면 알아서 닫혀요', kind: 'full',
    text: '정원이 차면 모집이 자동으로 마감되고, 팀원에게만 팀 채팅방 링크가 열려요.',
    links: [['팀 확정 화면 →', '/posts/p-1/team']],
  },
]

export default function StepRows() {
  return (
    <section className="frame">
      <div className="sec-title"><h2 className="heading">팀이 되기까지, 세 단계</h2></div>
      {STEPS.map((s) => (
        <div className="caprow" key={s.no}>
          <div className="left">
            <span className="idx">{s.no}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
          <div className="mid"><Vignette kind={s.kind} width={324} /></div>
          <div className="links">
            {s.links.map(([text, to]) => <Link key={to} to={to}>{text}</Link>)}
          </div>
        </div>
      ))}
    </section>
  )
}
