// 지원·면담·승인 관련 서버 호출 함수.
// 상태 5단계: PENDING(검토 대기) → CHATTING(면담 중) → ACCEPTED(합류 확정)
//            REJECTED(선발 종료), CANCELED(신청 취소)
import { posts, postRoles, applications, messages, ME_ID } from '../mocks/data'
import { ACTIVE_STATUSES } from '../constants/codes'

let seq = 100
const appOf = (id) => applications.find((a) => a.id === id)

// 역할에 지원하기. 같은 역할에 이전에 낸(취소한) 지원서가 있으면 새로 덮어써요.
export async function apply(postId, roleId, message) {
  const old = applications.findIndex((a) => a.roleId === roleId && a.applicantId === ME_ID)
  if (old >= 0) applications.splice(old, 1)
  const app = {
    id: `a-${seq++}`, postId, roleId, applicantId: ME_ID, message,
    status: 'PENDING', createdAt: new Date().toISOString(),
  }
  applications.push(app)
  return app
}

// 내가 낸 지원 취소
export async function cancel(applicationId) {
  appOf(applicationId).status = 'CANCELED'
}

// 작성자가 면담 시작 → 1:1 채팅이 열려요
export async function startChat(applicationId, authorId) {
  const app = appOf(applicationId)
  app.status = 'CHATTING'
  if (!messages.some((m) => m.applicationId === applicationId)) {
    await sendMessage(applicationId, authorId, '안녕하세요! 지원 고마워요. 잠깐 이야기 나눠 볼까요?')
  }
}

export async function sendMessage(applicationId, senderId, body) {
  const msg = { id: `m-${seq++}`, applicationId, senderId, body, createdAt: new Date().toISOString() }
  messages.push(msg)
  return msg
}

export async function getMessages(applicationId) {
  return messages.filter((m) => m.applicationId === applicationId)
}

// 합류 확정. 자리가 다 차면 남은 지원자는 자동으로 선발 종료, 모든 역할이 차면 모집 마감.
// 돌려주는 값: 화면에 띄울 안내 문구
export async function accept(applicationId) {
  const app = appOf(applicationId)
  app.status = 'ACCEPTED'
  const post = posts.find((p) => p.id === app.postId)
  const role = postRoles.find((r) => r.id === app.roleId)

  const countOf = (r) =>
    (r.id === post.authorRoleId ? 1 : 0) +
    applications.filter((a) => a.roleId === r.id && a.status === 'ACCEPTED').length
  const closeRest = (r) =>
    applications
      .filter((a) => a.roleId === r.id && ACTIVE_STATUSES.includes(a.status))
      .forEach((a) => { a.status = 'REJECTED' })

  let notice = '합류를 확정했어요'
  if (countOf(role) >= role.capacity) {
    closeRest(role)
    notice = '자리가 다 찼어요. 남은 지원자는 선발 종료로 바뀌었어요'
  }
  const roles = postRoles.filter((r) => r.postId === post.id)
  if (roles.every((r) => countOf(r) >= r.capacity)) {
    post.status = 'CLOSED'
    roles.forEach(closeRest)
    notice = '정원이 다 차서 모집이 자동으로 마감됐어요'
  }
  return notice
}

// 선발 종료 (거절)
export async function reject(applicationId) {
  appOf(applicationId).status = 'REJECTED'
}

// 확정·종료를 되돌려 다시 검토 대기로. 마감됐던 모집도 다시 열어요.
export async function undo(applicationId) {
  const app = appOf(applicationId)
  app.status = 'PENDING'
  posts.find((p) => p.id === app.postId).status = 'OPEN'
}
