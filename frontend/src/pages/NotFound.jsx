// 없는 주소나 없는 모집글로 들어왔을 때 보여 주는 화면.
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="frame page">
      <div className="intro">
        <h1 className="display">찾는 화면이 없어요</h1>
        <p className="statement">주소가 바뀌었거나 지워진 모집글일 수 있어요.</p>
        <div className="pair"><Link className="btn p" to="/board">목록으로</Link></div>
      </div>
    </div>
  )
}
