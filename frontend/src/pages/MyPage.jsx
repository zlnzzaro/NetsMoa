// 내 정보 화면 (주소: /me). 프로필 메뉴의 '내 정보'를 누르면 와요.
// 닉네임, 이메일, 학번, 한 줄 소개, 기술스택, 희망 역할을 보여 줘요.
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Icon from '../components/common/Icon'
import SkillChips from '../components/common/SkillChips'
import ProfileForm from '../components/me/ProfileForm'
import PasswordForm from '../components/me/PasswordForm'
import PhotoField from '../components/me/PhotoField'
import useLoad from '../hooks/useLoad'
import { getMe } from '../api/users'
import { USER_ROLE } from '../constants/codes'
import { useMe } from '../context/MeContext'

// 비어 있는 값은 회색으로 '아직 없어요'
const orNone = (v) => v || <span className="muted">아직 없어요</span>

export default function MyPage() {
  const { isGuest } = useMe()
  const { data: me, error, reload } = useLoad(() => (isGuest ? Promise.resolve(null) : getMe()), [isGuest])
  // 지금 보여 줄 화면: 'view' 보기 / 'edit' 정보 수정 / 'password' 비밀번호 변경
  const [mode, setMode] = useState('view')
  const toView = () => setMode('view')

  if (isGuest) return <Navigate to="/login?next=/me" replace />

  return (
    <div className="frame page">
      <Link className="back" to="/"><Icon name="left" />홈</Link>
      <div className="intro">
        <h1 className="display">내 정보</h1>
        <p className="statement">팀원 모집글에 보이는 내 정보예요.</p>
      </div>

      <div className="form">
        {error ? (
          <div className="empty">
            <p>내 정보를 불러오지 못했어요.</p>
            <div className="pair" style={{ justifyContent: 'center', marginTop: 14 }}>
              <button className="btn s" onClick={reload}>다시 시도</button>
            </div>
          </div>
        ) : !me ? (
          <p className="empty">내 정보를 불러오는 중이에요</p>
        ) : mode === 'edit' ? (
          <ProfileForm me={me} onCancel={toView} onSaved={() => { toView(); reload() }} />
        ) : mode === 'password' ? (
          <PasswordForm onCancel={toView} onDone={toView} />
        ) : (
          <>
            <PhotoField />
            <div className="frow">
              <span className="lab">닉네임</span>
              <div className="val">{me.nickname}</div>
            </div>
            <div className="frow">
              <span className="lab">이메일</span>
              <div className="val">{me.email}<small>이메일은 바꿀 수 없어요</small></div>
            </div>
            <div className="frow">
              <span className="lab">학번</span>
              <div className="val">{orNone(me.studentId)}</div>
            </div>
            <div className="frow">
              <span className="lab">한 줄 소개</span>
              <div className="val">{orNone(me.bio)}</div>
            </div>
            <div className="frow">
              <span className="lab">기술스택</span>
              <div className="val">
                {me.skills.length > 0 ? <SkillChips skills={me.skills} /> : orNone(null)}
              </div>
            </div>
            <div className="frow">
              <span className="lab">희망 역할</span>
              <div className="val">
                {me.roles.length > 0 ? (
                  <ul className="chips" aria-label="희망 역할">
                    {me.roles.map((code) => <li key={code} className="tag">{USER_ROLE[code]?.name ?? code}</li>)}
                  </ul>
                ) : orNone(null)}
              </div>
            </div>

            <div className="form-foot pair">
              <button className="btn p" onClick={() => setMode('edit')}>정보 수정</button>
              <button className="btn s" onClick={() => setMode('password')}>비밀번호 변경</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
