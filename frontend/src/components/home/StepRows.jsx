// "팀이 되기까지, 세 단계" — 01·02·03을 가로 3칸으로 나란히.
// 각 칸: 번호 / 제목 / 짧은 설명 / 작은 예시 화면 / 바로 가기 링크.
// 좁은 화면(태블릿·폰)에서는 칸을 옆으로 넘겨 봐요.
import { Link } from 'react-router-dom'
import Vignette from '../common/Vignette'

const STEPS = [
  {
    no: '01', title: '역할을 골라 지원해요', kind: 'apply',
    text: '빈 역할을 고르고 한 줄 소개만 쓰면 돼요. 내 스택과 맞으면 매칭 표시가 붙어요.',
    link: ['지원 화면 보기 →', '/posts/p-1'],
  },
  {
    no: '02', title: '1:1로 먼저 이야기해요', kind: 'chat',
    text: '작성자가 면담을 요청하면 두 사람만 보는 채팅이 열려요.',
    link: ['면담 화면 보기 →', '/posts/p-1/manage'],
  },
  {
    no: '03', title: '자리가 차면 알아서 닫혀요', kind: 'full',
    text: '정원이 차면 자동으로 마감되고, 팀원에게만 팀 채팅 링크가 열려요.',
    link: ['팀 확정 화면 보기 →', '/posts/p-1/team'],
  },
]

export default function StepRows() {
  return (
    <section className="frame">
      <div className="sec-title">
        <h2 className="heading">팀이 되기까지, 세 단계</h2>
        <span className="cap steps-hint">옆으로 넘겨 보세요</span>
      </div>
      <ol className="steps3">
        {STEPS.map((s) => (
          <li className="step" key={s.no}>
            <span className="idx">{s.no}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            <div className="ex"><Vignette kind={s.kind} width={240} /></div>
            <Link className="go" to={s.link[1]}>{s.link[0]}</Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
