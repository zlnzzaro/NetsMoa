// 모든 화면 맨 아래의 숯색 마무리 영역.
// 6칸 링크 + 저작권 한 줄.
import { Link } from 'react-router-dom'
import Icon from '../common/Icon'
import { pad2 } from '../../utils/post'
import { DEMO_POST_ID } from '../../lib/supabase'

const demo = `/posts/${DEMO_POST_ID}`

const COLUMNS = [
  ['팀원 찾기', [['모집글 목록', '/board'], ['모집글 쓰기', '/write']]],
  ['내 활동', [['내 모집글 관리', '/mine'], ['내 팀', '/mine#teams']]],
  ['지원 상태', [['내 지원 현황', '/mine#applied'], ['내 팀', '/mine#teams']]],
  ['분류', [['공모전', '/board?category=COMPETITION'], ['스터디', '/board?category=STUDY'], ['캡스톤', '/board?category=CAPSTONE'], ['사이드 프로젝트', '/board?category=SIDE_PROJECT']]],
  ['시연 순서', [['목록', '/'], ['지원', demo], ['면담·확정', `${demo}/manage`], ['팀 채팅', `${demo}/team`]]],
  ['만든 팀', [['2026 컴퓨터학부 해커톤', '/'], ['글솝net', '/']]],
]

export default function Footer() {
  return (
    <footer className="ending">
      <div className="frame">
        <Link className="sales" to="/write">모집글 쓰고 팀원 모으기 <Icon name="right" /></Link>

        <div className="fgrid">
          {COLUMNS.map(([label, links], i) => (
            <div className="fcol" key={label}>
              <span className="lab">{label}</span>
              {links.map(([text, to]) => <Link key={text} to={to}>{text}</Link>)}
              <span className="idx">{pad2(i + 1)}</span>
            </div>
          ))}
        </div>

        <div className="disclose">
          <span>© 2026 NETogether</span>
        </div>
      </div>
    </footer>
  )
}
