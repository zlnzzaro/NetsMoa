// 로그인 / 회원가입 (주소: /login?next=/posts/...)
// 로그인하면 next 주소(없으면 홈)로 돌아가요.
import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import Icon from '../components/common/Icon'
import { isNicknameAvailable, signIn, signUp } from '../api/auth'
import { isDemoMode } from '../lib/supabase'
import { useMe } from '../context/MeContext'
import { useToast } from '../context/ToastContext'

// 발표·심사용 시연 계정 (backend/supabase/seed.sql 로 만들어져요)
const DEMO_PASSWORD = 'netsmoa1234'
const DEMO_ACCOUNTS = [
  { email: 'yujin@netsmoa.dev', label: '지원자(유진)로 둘러보기' },
  { email: 'seojun@netsmoa.dev', label: '작성자(박서준)로 둘러보기' },
]

const isStrong = (pw) => pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw)
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())

export default function LoginPage() {
  const [params] = useSearchParams()
  const next = params.get('next') || '/'
  const navigate = useNavigate()
  const toast = useToast()
  const { isGuest, refreshMe } = useMe()
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login')
  const [form, setForm] = useState({ email: '', password: '', nickname: '', studentId: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sentTo, setSentTo] = useState('') // 인증 메일을 보낸 주소

  if (isDemoMode || !isGuest) return <Navigate to={next} replace />

  const set = (field) => (e) => { setForm({ ...form, [field]: e.target.value }); setError('') }

  const done = async (text) => {
    await refreshMe()
    toast(text)
    navigate(next, { replace: true })
  }

  const login = async (email, password) => {
    setBusy(true)
    setError('')
    try {
      await signIn(email, password)
      await done('로그인했어요')
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const register = async () => {
    const nick = form.nickname.trim()
    if (!isEmail(form.email)) return setError('이메일 주소를 확인해 주세요')
    if (!isStrong(form.password)) return setError('비밀번호는 8자 이상, 영문과 숫자를 함께 적어 주세요')
    if (nick.length < 2 || nick.length > 12) return setError('닉네임은 2~12자로 적어 주세요')
    setBusy(true)
    setError('')
    try {
      if (!(await isNicknameAvailable(nick))) {
        setBusy(false)
        return setError('이미 사용 중인 닉네임이에요')
      }
      const loggedIn = await signUp(form)
      if (loggedIn) await done(`${nick}님, 환영해요!`)
      else { setSentTo(form.email.trim()); setBusy(false) }
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const submit = (e) => {
    e.preventDefault()
    if (busy) return
    if (mode === 'login') login(form.email, form.password)
    else register()
  }

  if (sentTo) {
    return (
      <div className="frame page">
        <div className="intro">
          <h1 className="display">메일함을 확인해 주세요</h1>
          <p className="statement">{sentTo} 로 인증 링크를 보냈어요. 링크를 누르면 로그인돼요.</p>
          <div className="pair"><button className="btn s" onClick={() => { setSentTo(''); setMode('login') }}>로그인 화면으로</button></div>
        </div>
      </div>
    )
  }

  return (
    <div className="frame page">
      <Link className="back" to="/"><Icon name="left" />홈</Link>
      <div className="intro">
        <h1 className="display">{mode === 'login' ? '다시 만나서 반가워요' : '같이 만들 사람을 찾아요'}</h1>
        <p className="statement">
          {mode === 'login' ? '로그인하면 지원하고, 모집글을 쓰고, 면담 채팅을 할 수 있어요.' : '이메일로 가입하고 내 기술스택을 적어 두면 맞는 역할을 찾아 줘요.'}
        </p>
        <div className="seg" role="tablist">
          <button type="button" className={mode === 'login' ? 'on' : ''} onClick={() => { setMode('login'); setError('') }}>로그인</button>
          <button type="button" className={mode === 'signup' ? 'on' : ''} onClick={() => { setMode('signup'); setError('') }}>회원가입</button>
        </div>
      </div>

      <form className="form" onSubmit={submit} noValidate>
        <div className="frow">
          <label htmlFor="l-email">이메일</label>
          <input className="inp" id="l-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" autoFocus />
        </div>
        <div className="frow">
          <label htmlFor="l-pw">비밀번호</label>
          <div>
            <input className="inp" id="l-pw" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={form.password} onChange={set('password')} />
            {mode === 'signup' && <small>8자 이상, 영문과 숫자를 함께 적어 주세요</small>}
          </div>
        </div>
        {mode === 'signup' && (
          <>
            <div className="frow">
              <label htmlFor="l-nick">닉네임</label>
              <div>
                <input className="inp" id="l-nick" autoComplete="nickname" value={form.nickname} onChange={set('nickname')} />
                <small>2~12자 · 모집글과 팀원 목록에 보여요</small>
              </div>
            </div>
            <div className="frow">
              <label htmlFor="l-sid">학번 (선택)</label>
              <div>
                <input className="inp" id="l-sid" inputMode="numeric" value={form.studentId} onChange={set('studentId')} placeholder="2025012345" />
                <small>나만 볼 수 있어요</small>
              </div>
            </div>
          </>
        )}

        {error && <p className="err" role="alert">{error}</p>}
        <div className="pair form-foot">
          <button className="btn p" disabled={busy}>{busy ? '잠시만요…' : mode === 'login' ? '로그인' : '가입하기'}</button>
          {mode === 'login' && DEMO_ACCOUNTS.map((d) => (
            <button key={d.email} type="button" className="btn s" disabled={busy} onClick={() => login(d.email, DEMO_PASSWORD)}>
              {d.label}
            </button>
          ))}
        </div>
        {mode === 'login' && (
          <p className="cap" style={{ marginTop: 14 }}>
            시연 계정 비밀번호는 모두 {DEMO_PASSWORD} 예요. 박서준 계정은 '캠퍼스 중고거래 웹' 모집글의 작성자라 지원자 관리·합류 확정을 해 볼 수 있어요.
          </p>
        )}
      </form>
    </div>
  )
}
