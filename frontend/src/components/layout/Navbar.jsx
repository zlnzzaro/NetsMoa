// 맨 위에 고정된 상단바. 글씨 굵기는 300(Light)만 써요.
import { Link, NavLink } from 'react-router-dom'
import Icon from '../common/Icon'
import ProfileMenu from './ProfileMenu'

export default function Navbar() {
  // 지금 보고 있는 화면의 메뉴에 'on' 클래스를 붙여요
  const cls = ({ isActive }) => (isActive ? 'nl on' : 'nl')
  return (
    <header className="navwrap">
      <div className="frame">
        <nav className="top">
          <Link className="logo" to="/"><span className="mk" />NETogether</Link>
          <NavLink className={cls} to="/" end>팀원 찾기</NavLink>
          <NavLink className={(s) => `${cls(s)} hide-m`} to="/posts/p-1/manage">내 모집글</NavLink>
          <NavLink className={(s) => `${cls(s)} hide-m`} to="/posts/p-1/team">내 팀</NavLink>
          <div className="spacer" />
          <Link className="btn p wbtn" to="/write" aria-label="모집글 쓰기">
            <Icon name="plus" size={13} /><span>모집글 쓰기</span>
          </Link>
          <ProfileMenu />
        </nav>
      </div>
    </header>
  )
}
