// 첫 화면 맨 위: 가운데 큰 문구 + 둘레에 둥둥 떠 있는 화면 조각들.
// 폰 화면에서는 조각을 하나만 문구 아래에 보여 줘요.
import { Link } from 'react-router-dom'
import Vignette from '../common/Vignette'

// [조각 종류, 크기, 위치]
const FLOATS = [
  ['apply', 280, { left: 'max(-40px, calc(50% - 760px))', top: 90 }],
  ['chat', 270, { right: 'max(-30px, calc(50% - 740px))', top: 70, animationDelay: '-4s' }],
  ['seats', 268, { left: 'calc(50% - 520px)', bottom: -60, animationDelay: '-7s' }],
  ['match', 288, { right: 'calc(50% - 560px)', bottom: -30, animationDelay: '-2s' }],
  ['full', 260, { left: 'calc(50% - 130px)', top: -190, animationDelay: '-9s' }],
]

export default function HeroSection() {
  return (
    <section className="hero">
      {FLOATS.map(([kind, w, style]) => (
        <div key={kind} className="float drift hide-s" style={style}><Vignette kind={kind} width={w} /></div>
      ))}
      <div className="pocket">
        {/* 홈 메인 문구: 굵기 700 */}
        <h1 className="display">팀원 모으기,<br />여기서 끝내요</h1>
        <p>역할을 골라 지원하고, 1:1로 이야기한 뒤 합류를 정해요. 자리가 다 차면 모집은 알아서 닫혀요.</p>
        <div className="pair">
          <Link className="btn p" to="/write">모집글 쓰기</Link>
          <Link className="btn s" to="/#feed">팀 둘러보기</Link>
        </div>
      </div>
      <div className="floats-s"><Vignette kind="seats" width={300} /></div>
    </section>
  )
}
