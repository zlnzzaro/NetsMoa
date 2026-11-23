// 내 정보 (Supabase)
import { supabase, rpc, toError } from '../../lib/supabase'

const toMe = (p) => ({
  id: p.id,
  email: p.email,
  nickname: p.nickname,
  studentId: p.student_id,
  bio: p.bio,
  skills: p.skills ?? [],
  roles: p.roles ?? [],
  photoUrl: p.photo_url,
})

export const getMe = async () => toMe(await rpc('get_me'))

// 보낸 값만 바꿔요. 닉네임 중복이면 err.status 409
export async function updateMe({ nickname, bio, skills, roles }) {
  const p = {}
  if (nickname !== undefined) p.nickname = nickname
  if (bio !== undefined) p.bio = bio
  if (skills !== undefined) p.skills = skills
  if (roles !== undefined) p.roles = roles
  return toMe(await rpc('update_me', { p }))
}

export async function savePhoto(dataUrl) {
  await rpc('update_me', { p: { photo_url: dataUrl ?? '' } })
  return dataUrl
}

// 현재 비밀번호를 한 번 더 확인한 뒤 바꿔요 (틀리면 401, 규칙 위반이면 400)
export async function changePassword({ currentPassword, newPassword }) {
  const ok = newPassword.length >= 8 && /[A-Za-z]/.test(newPassword) && /\d/.test(newPassword)
  if (!ok) throw Object.assign(new Error('새 비밀번호는 8자 이상, 영문과 숫자를 함께 적어 주세요'), { status: 400 })
  const { data } = await supabase.auth.getSession()
  const email = data.session?.user.email
  const check = await supabase.auth.signInWithPassword({ email, password: currentPassword })
  if (check.error) throw Object.assign(new Error('현재 비밀번호가 맞지 않아요'), { status: 401 })
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw toError(error)
}
