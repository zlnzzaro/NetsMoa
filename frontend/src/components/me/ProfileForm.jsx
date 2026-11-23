// 내 정보 화면의 '정보 수정' 폼. 닉네임·한 줄 소개·기술스택·희망 역할을 고칠 수 있어요.
// 이메일과 학번은 바꿀 수 없어서 글씨로만 보여 줘요.
// me: 지금 내 정보 / onSaved: 저장 끝났을 때 / onCancel: 취소 눌렀을 때
import { useState } from 'react'
import SkillChips from '../common/SkillChips'
import RolePicker from './RolePicker'
import { useMe } from '../../context/MeContext'
import { useToast } from '../../context/ToastContext'
import { splitComma } from '../../utils/post'

export default function ProfileForm({ me, onSaved, onCancel }) {
  const { saveProfile } = useMe()
  const toast = useToast()
  // 입력칸 값 (처음엔 지금 내 정보로 채워 둬요)
  const [nickname, setNickname] = useState(me.nickname)
  const [bio, setBio] = useState(me.bio || '')
  const [skillsText, setSkillsText] = useState(me.skills.join(', '))
  const [roles, setRoles] = useState(me.roles)
  const [nickTaken, setNickTaken] = useState(false) // 중복 닉네임 오류
  const [error, setError] = useState('') // 그 밖의 오류
  const [saving, setSaving] = useState(false)

  const nick = nickname.trim()
  const nickOk = nick.length >= 2 && nick.length <= 12
  const skills = [...new Set(splitComma(skillsText))] // 같은 기술을 두 번 적어도 한 번만
  const changed = nick !== me.nickname || bio.trim() !== (me.bio || '') || skills.join(',') !== me.skills.join(',') ||
    roles.join(',') !== me.roles.join(',')
  const canSave = nickOk && changed && !saving

  const submit = async (e) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    setError('')
    try {
      await saveProfile({ nickname: nick, bio: bio.trim(), skills, roles })
      toast('내 정보를 저장했어요')
      onSaved()
    } catch (err) {
      if (err.status === 409) setNickTaken(true)
      else setError('저장하지 못했어요. 잠시 뒤 다시 시도해 주세요')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="frow">
        <label htmlFor="me-nick">닉네임</label>
        <div>
          <input className="inp" id="me-nick" value={nickname} autoComplete="nickname"
            onChange={(e) => { setNickname(e.target.value); setNickTaken(false) }} />
          {nickTaken
            ? <small className="bad" role="alert">이미 사용 중인 닉네임이에요</small>
            : <small className={nick && !nickOk ? 'bad' : ''}>2~12자로 적어 주세요</small>}
        </div>
      </div>
      <div className="frow">
        <span className="lab">이메일</span>
        <div className="val">{me.email}<small>이메일은 바꿀 수 없어요</small></div>
      </div>
      <div className="frow">
        <span className="lab">학번</span>
        <div className="val">{me.studentId || <span className="muted">아직 없어요</span>}</div>
      </div>
      <div className="frow">
        <label htmlFor="me-bio">한 줄 소개</label>
        <input className="inp" id="me-bio" value={bio} onChange={(e) => setBio(e.target.value)}
          placeholder="예: 컴퓨터학부 2학년 · 프론트엔드" />
      </div>
      <div className="frow">
        <label htmlFor="me-skills">기술스택</label>
        <div>
          <input className="inp" id="me-skills" value={skillsText} onChange={(e) => setSkillsText(e.target.value)}
            placeholder="React, JavaScript, Figma" />
          <small>쉼표로 구분해 주세요</small>
          {skills.length > 0 && <SkillChips skills={skills} className="d-stack" />}
        </div>
      </div>
      <div className="frow">
        <span className="lab" id="me-roles">희망 역할</span>
        <div>
          <RolePicker value={roles} onChange={setRoles} labelledBy="me-roles" />
          <small>여러 개 고를 수 있어요</small>
        </div>
      </div>

      {error && <p className="err">{error}</p>}
      <div className="form-foot pair">
        <button className="btn p" disabled={!canSave}>{saving ? '저장 중…' : '저장'}</button>
        <button type="button" className="btn s" onClick={onCancel}>취소</button>
      </div>
    </form>
  )
}
