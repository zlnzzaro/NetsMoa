// 로그인·회원가입 (Supabase Auth, 이메일 + 비밀번호)
import { supabase, rpc } from '../../lib/supabase'
import { getMe, savePhoto } from './users'

const KO = [
  [/invalid login credentials/i, '이메일 또는 비밀번호가 맞지 않아요'],
  [/already registered|already exists/i, '이미 가입된 이메일이에요. 로그인해 주세요'],
  [/email not confirmed/i, '메일함에서 인증 링크를 먼저 눌러 주세요'],
  [/password should be at least/i, '비밀번호는 8자 이상으로 적어 주세요'],
  [/error sending .*email/i, '인증 메일을 보내지 못했어요. 메일 서버(SMTP) 설정을 확인해 주세요'],
  [/email rate limit|over_email_send_rate_limit/i, '인증 메일을 너무 많이 보냈어요. 잠시 뒤 다시 시도해 주세요'],
  [/rate limit|too many/i, '요청이 많아요. 잠시 뒤 다시 시도해 주세요'],
  [/invalid.*email|unable to validate email/i, '이메일 주소를 확인해 주세요'],
  // DB 트리거(school_email.sql)가 막으면 Auth 는 이 문구로 돌려줘요
  [/database error saving new user|학교 이메일/i, '학교 이메일로만 가입할 수 있어요'],
]
const korean = (error) => {
  const hit = KO.find(([re]) => re.test(error.message))
  return Object.assign(new Error(hit ? hit[1] : error.message), { status: error.status, code: error.code })
}

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error) throw korean(error)
}

// 돌려주는 값: true = 바로 로그인됨, false = 인증 메일 확인이 필요함
export async function signUp({ email, password, nickname, studentId }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { nickname: nickname.trim(), student_id: studentId.trim() }, emailRedirectTo: window.location.origin },
  })
  if (error) throw korean(error)
  // 이미 가입된 이메일이면 Supabase 는 오류 대신 빈 identities 를 돌려줘요 (메일도 안 가요)
  if (data.user && data.user.identities?.length === 0) {
    throw Object.assign(new Error('이미 가입된 이메일이에요. 로그인해 주세요'), { status: 409 })
  }
  return !!data.session
}

// 인증 메일 다시 보내기
export async function resendSignup(email) {
  const { error } = await supabase.auth.resend({
    type: 'signup', email: email.trim(), options: { emailRedirectTo: window.location.origin },
  })
  if (error) throw korean(error)
}

export async function signOut() {
  await supabase.auth.signOut()
}

export const isNicknameAvailable = (nickname) => rpc('nickname_available', { p_nickname: nickname })

// 로그인 상태가 바뀌면 불러요 (로그인/로그아웃/토큰 갱신)
export function onAuthChange(fn) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => fn(event, session))
  return () => data.subscription.unsubscribe()
}

export async function hasSession() {
  const { data } = await supabase.auth.getSession()
  return !!data.session
}

// 프로필 사진은 profiles.photo_url 에 저장해요 (256px JPEG 라 작아요)
export const getMyPhoto = async () => (await getMe()).photoUrl ?? null
export const saveMyPhoto = savePhoto
