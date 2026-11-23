// 내 정보(회원) 관련 서버 호출 함수.
// 화면(pages/)은 mocks 를 직접 읽지 않고 항상 이 함수들만 불러요.
// 백엔드가 생기면 함수 안쪽만 fetch('/api/users/me') 같은 코드로 바꾸면 돼요.
import { users, passwords, ME_ID } from '../mocks/data'
import { USER_ROLE, MAX_SKILLS } from '../constants/codes'

// 서버가 돌려줄 모양 그대로 골라 담아요. (비밀번호 같은 값은 절대 넣지 않아요)
function toMe(u) {
  return {
    id: u.id,
    email: u.email,
    nickname: u.nickname,
    studentId: u.studentId,
    bio: u.bio,
    skills: [...u.skills],
    roles: [...(u.roles || [])], // 희망 역할 코드 (USER_ROLE)
  }
}

// 내 정보 — GET /api/users/me
export async function getMe() {
  const me = users.find((u) => u.id === ME_ID)
  if (!me) throw new Error('내 정보를 찾을 수 없어요')
  return toMe(me)
}

// 서버 오류 흉내: fetch 로 바꾼 뒤에도 화면은 err.status 로 구분하면 돼요 (409 = 중복, 401 = 비밀번호 틀림)
function apiError(status, message) {
  const err = new Error(message)
  err.status = status
  return err
}

// 내 정보 수정 — PATCH /api/users/me
// 보낸 값만 바꿔요. 다른 사람이 쓰는 닉네임이면 409, 기술스택이 10개를 넘으면 400 오류를 던져요.
export async function updateMe({ nickname, bio, skills, roles }) {
  const me = users.find((u) => u.id === ME_ID)
  // 닉네임 검사
  if (nickname !== undefined) {
    const nick = nickname.trim()
    if (nick.length < 2 || nick.length > 12) throw apiError(400, '닉네임은 2~12자로 적어 주세요')
    if (users.some((u) => u.id !== ME_ID && u.nickname === nick)) throw apiError(409, '이미 사용 중인 닉네임이에요')
  }
  // 검사를 모두 통과한 뒤에 바꿔요 (하나라도 실패하면 아무것도 안 바뀌게)
  if (skills !== undefined && new Set(skills).size > MAX_SKILLS) throw apiError(400, `기술스택은 ${MAX_SKILLS}개까지 고를 수 있어요`)
  if (nickname !== undefined) me.nickname = nickname.trim()
  if (bio !== undefined) me.bio = bio.trim()
  if (skills !== undefined) me.skills = [...new Set(skills)]
  // 정해진 코드만, USER_ROLE 순서대로 저장해요
  if (roles !== undefined) me.roles = Object.keys(USER_ROLE).filter((code) => roles.includes(code))
  return toMe(me)
}

// 비밀번호 변경 — PATCH /api/users/me/password
// 현재 비밀번호가 틀리면 401, 새 비밀번호가 규칙(8자 이상 + 영문·숫자)에 안 맞으면 400 오류를 던져요.
// 성공하면 아무것도 돌려주지 않아요.
export async function changePassword({ currentPassword, newPassword }) {
  if (passwords[ME_ID] !== currentPassword) throw apiError(401, '현재 비밀번호가 맞지 않아요')
  const ok = newPassword.length >= 8 && /[A-Za-z]/.test(newPassword) && /\d/.test(newPassword)
  if (!ok) throw apiError(400, '새 비밀번호는 8자 이상, 영문과 숫자를 함께 적어 주세요')
  passwords[ME_ID] = newPassword
}
