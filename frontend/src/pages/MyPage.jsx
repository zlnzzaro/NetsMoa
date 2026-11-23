// 내 정보 화면 (주소: /me). 프로필 메뉴의 '내 정보'를 누르면 와요.
// 닉네임, 이메일, 학번, 한 줄 소개, 기술스택을 보여 줘요.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/common/Icon'
import SkillChips from '../components/common/SkillChips'
import ProfileForm from '../components/me/ProfileForm'
import useLoad from '../hooks/useLoad'
import { getMe } from '../api/users'

// 비어 있는 값은 회색으로 '아직 없어요'
const orNone = (v) => v || <span className="muted">아직 없어요</span>

export default function MyPage() {
  const { data: me, error, reload } = useLoad(getMe, [])
  const [editing, setEditing] = useState(false) // true 면 입력 폼을 보여 줘요

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
        ) : editing ? (
          <ProfileForm me={me} onCancel={() => setEditing(false)} onSaved={() => { setEditing(false); reload() }} />
        ) : (
          <>
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

            <div className="form-foot pair">
              {/* 비밀번호 변경은 다음 단계에서 연결해요 */}
              <button className="btn p" onClick={() => setEditing(true)}>정보 수정</button>
              <button className="btn s" disabled>비밀번호 변경</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
