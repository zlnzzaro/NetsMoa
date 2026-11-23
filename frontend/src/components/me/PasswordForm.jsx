// 내 정보 화면의 '비밀번호 변경' 폼.
// 비밀번호는 화면 밖으로 내보내지 않아요 (console.log 금지, 저장도 이 컴포넌트 안에서만).
// onDone: 바꾸기에 성공했을 때 / onCancel: 취소 눌렀을 때
import { useState } from 'react'
import { useToast } from '../../context/ToastContext'
import { changePassword } from '../../api/users'

const EMPTY = { current: '', next: '', confirm: '' }

// 새 비밀번호 규칙: 8자 이상 + 영문과 숫자를 함께
const isStrong = (pw) => pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw)

export default function PasswordForm({ onDone, onCancel }) {
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const [wrongCurrent, setWrongCurrent] = useState(false) // 현재 비밀번호 틀림(401)
  const [error, setError] = useState('') // 그 밖의 오류
  const [saving, setSaving] = useState(false)

  // 입력칸 값 하나 바꾸기: set('next')(이벤트)
  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    if (field === 'current') setWrongCurrent(false)
  }

  const strong = isStrong(form.next)
  const same = form.next !== '' && form.next === form.current // 지금 비밀번호와 같으면 막아요
  const mismatch = form.confirm !== '' && form.confirm !== form.next
  const canSave = form.current !== '' && strong && !same && form.confirm === form.next && !saving

  const submit = async (e) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    setError('')
    try {
      await changePassword({ currentPassword: form.current, newPassword: form.next })
      setForm(EMPTY) // 입력칸 비우기
      toast('비밀번호를 바꿨어요')
      onDone()
    } catch (err) {
      if (err.status === 401) setWrongCurrent(true)
      else setError('비밀번호를 바꾸지 못했어요. 잠시 뒤 다시 시도해 주세요')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="frow">
        <label htmlFor="pw-current">현재 비밀번호</label>
        <div>
          <input className="inp" id="pw-current" type="password" autoComplete="current-password"
            value={form.current} onChange={set('current')} />
          {wrongCurrent && <small className="bad" role="alert">현재 비밀번호가 맞지 않아요</small>}
        </div>
      </div>
      <div className="frow">
        <label htmlFor="pw-next">새 비밀번호</label>
        <div>
          <input className="inp" id="pw-next" type="password" autoComplete="new-password"
            value={form.next} onChange={set('next')} />
          {same
            ? <small className="bad">지금 비밀번호와 다르게 적어 주세요</small>
            : <small className={form.next && !strong ? 'bad' : ''}>8자 이상, 영문과 숫자를 함께 적어 주세요</small>}
        </div>
      </div>
      <div className="frow">
        <label htmlFor="pw-confirm">새 비밀번호 확인</label>
        <div>
          <input className="inp" id="pw-confirm" type="password" autoComplete="new-password"
            value={form.confirm} onChange={set('confirm')} />
          {mismatch && <small className="bad">새 비밀번호가 서로 달라요</small>}
        </div>
      </div>

      {error && <p className="err">{error}</p>}
      <div className="form-foot pair">
        <button className="btn p" disabled={!canSave}>{saving ? '변경 중…' : '변경'}</button>
        <button type="button" className="btn s" onClick={onCancel}>취소</button>
      </div>
    </form>
  )
}
