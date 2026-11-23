// 로그인·회원가입 (Supabase Auth, 이메일 + 비밀번호)
import { supabase, rpc } from '../../lib/supabase'
import { getMe, savePhoto } from './users'

const KO = [
  [/invalid login credentials/i, '이메일 또는 비밀번호가 맞지 않아요'],
  [/already registered|already exists/i, '이미 가입된 이메일이에요. 로그인해 주세요'],
  [/email not confirmed/i, '메일함에서 인증 링크를 먼저 눌러 주세요'],
  [/password should be at least/i, '비밀번호는 8자 이상으로 적어 주세요'],
  [/rate limit|too many/i, '요청이 많아요. 잠시 뒤 다시 시도해 주세요'],
  [/invalid.*email|unable to validate email/i, '이메일 주소를 확인해 주세요'],
]
const korean = (error) => {
  const hit = KO.find(([re]) => re.test(error.message))
  return Object.assign(new Error(hit ? hit[1] : error.message), { status: error.status })
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
  return !!data.session
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
