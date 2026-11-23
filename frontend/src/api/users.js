// 내 정보(회원) 관련 서버 호출 함수.
// 화면(pages/)은 mocks 를 직접 읽지 않고 항상 이 함수들만 불러요.
// 백엔드가 생기면 함수 안쪽만 fetch('/api/users/me') 같은 코드로 바꾸면 돼요.
import { users, ME_ID } from '../mocks/data'

// 서버가 돌려줄 모양 그대로 골라 담아요. (비밀번호 같은 값은 절대 넣지 않아요)
function toMe(u) {
  return {
    id: u.id,
    email: u.email,
    nickname: u.nickname,
    studentId: u.studentId,
    bio: u.bio,
    skills: [...u.skills],
  }
}

// 내 정보 — GET /api/users/me
export async function getMe() {
  const me = users.find((u) => u.id === ME_ID)
  if (!me) throw new Error('내 정보를 찾을 수 없어요')
  return toMe(me)
}

// 내 정보 수정 — PATCH /api/users/me (3번에서 만들어요)
// export async function updateMe({ nickname, bio, skills }) {}

// 비밀번호 변경 — PATCH /api/users/me/password (4번에서 만들어요)
// export async function changePassword({ currentPassword, newPassword }) {}
