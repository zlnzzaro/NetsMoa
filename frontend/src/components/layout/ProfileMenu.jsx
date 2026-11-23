// 상단바 오른쪽 동그란 프로필 버튼 + 눌렀을 때 열리는 메뉴.
// 사진을 고르면 256px 정사각형으로 줄여서 저장해요.
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../common/Avatar'
import SkillChips from '../common/SkillChips'
import { useMe } from '../../context/MeContext'
import { useToast } from '../../context/ToastContext'

// 사진 파일 → 가운데를 정사각형으로 자른 256px JPEG 글자(data URL)
function resizePhoto(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    const img = new Image()
    reader.onload = () => { img.src = reader.result }
    img.onload = () => {
      const size = 256
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      const s = Math.min(img.width, img.height)
      canvas.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    reader.readAsDataURL(file)
  })
}

export default function ProfileMenu() {
  const { me, setPhoto } = useMe()
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

  const onPick = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    await setPhoto(await resizePhoto(file))
    toast('프로필 사진을 바꿨어요')
  }

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
            <label htmlFor="photoInput" title="사진 바꾸기">
              <Avatar user={me} size="xl" />
              <span className="edit">변경</span>
            </label>
            <div><span style={{ fontSize: 15 }}>{me.nickname}</span><small>{me.bio}</small></div>
          </div>
          <div className="stk">내 기술스택<SkillChips skills={me.skills} /></div>
          <hr />
          <label className="item" htmlFor="photoInput">프로필 사진 바꾸기</label>
          {me.photoUrl && (
            <button className="item" onClick={() => { setPhoto(null); toast('기본 프로필로 돌아갔어요') }}>사진 지우기</button>
          )}
          <button className="item" onClick={() => go('/me')}>내 정보</button>
          <button className="item" onClick={() => go('/posts/p-1/manage')}>내 모집글 관리</button>
          <button className="item" onClick={() => go('/posts/p-1/team')}>내 팀</button>
          <hr />
          <button className="item" onClick={() => { setOpen(false); toast('아직 로그인 기능이 없어요') }}>로그아웃</button>
        </div>
      )}
      {/* 메뉴가 닫혀 있어도 파일 선택 창은 남아 있어야 해서 밖에 둬요 */}
      <input type="file" id="photoInput" accept="image/*" hidden onChange={onPick} />
    </div>
  )
}
