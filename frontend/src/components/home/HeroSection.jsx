// 첫 화면 맨 위: 가운데 큰 문구 + 네 귀퉁이에 둥둥 떠 있는 화면 조각들.
// 조각 위치·크기는 index.css 의 .float.tl/.tr/.bl/.br 에서 정해요 (첫 화면 영역 기준 %).
// 폰 화면에서는 조각을 하나만 문구 아래에 보여 줘요.
import { Link } from 'react-router-dom'
import Vignette from '../common/Vignette'

// [조각 종류, 귀퉁이(왼쪽 위·오른쪽 위·왼쪽 아래·오른쪽 아래), 움직임 시작 시점]
const FLOATS = [
  ['apply', 'tl', '0s'],
  ['chat', 'tr', '-4s'],
  ['seats', 'bl', '-7s'],
  ['match', 'br', '-2s'],
]

export default function HeroSection() {
  return (
    <section className="hero">
      {FLOATS.map(([kind, corner, delay]) => (
        <div key={kind} className={`float drift hide-s ${corner}`} style={{ animationDelay: delay }}><Vignette kind={kind} /></div>
      ))}
      <div className="pocket">
        {/* 홈 메인 문구: 굵기 700 */}
        <h1 className="display">팀원 모으기,<br />여기서 끝내요</h1>
        <p>역할을 골라 지원하고, 1:1로 이야기한 뒤 합류를 정해요. 자리가 다 차면 모집은 알아서 닫혀요.</p>
        <div className="pair">
          <Link className="btn p" to="/write">모집글 쓰기</Link>
          <Link className="btn s" to="/board">팀 둘러보기</Link>
        </div>
      </div>
      <div className="floats-s"><Vignette kind="seats" width={300} /></div>
    </section>
  )
}
