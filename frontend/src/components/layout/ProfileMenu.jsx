// 상단바 오른쪽 동그란 프로필 버튼 + 눌렀을 때 열리는 메뉴.
// 프로필 사진은 '내 정보' 화면(/me)에서 바꿔요.
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../common/Avatar'
import SkillChips from '../common/SkillChips'
import { useMe } from '../../context/MeContext'
import { useToast } from '../../context/ToastContext'

export default function ProfileMenu() {
  const { me } = useMe()
  const toast = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const box = useRef(null)

  // 메뉴 바깥을 누르거나 Esc 를 누르면 닫아요
  useEffect(() => {
    if (!open) return
    const onClick = (e) => { if (!box.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const go = (path) => { setOpen(false); navigate(path) }

  return (
    <div className="profile" ref={box}>
      <button id="avatarBtn" aria-haspopup="true" aria-expanded={open} aria-label="내 프로필 메뉴"
        onClick={() => setOpen(!open)}>
        <Avatar user={me} />
      </button>

      {open && (
        <div className="menu">
          <div className="me">
            <Avatar user={me} size="xl" />
            <div><span style={{ fontSize: 15 }}>{me.nickname}</span><small>{me.bio}</small></div>
          </div>
          <div className="stk">내 기술스택<SkillChips skills={me.skills} /></div>
          <hr />
          <button className="item" onClick={() => go('/me')}>내 정보</button>
          <button className="item" onClick={() => go('/posts/p-1/manage')}>내 모집글 관리</button>
          <button className="item" onClick={() => go('/posts/p-1/team')}>내 팀</button>
          <hr />
          <button className="item" onClick={() => { setOpen(false); toast('아직 로그인 기능이 없어요') }}>로그아웃</button>
        </div>
      )}
    </div>
  )
}
