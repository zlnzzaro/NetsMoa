// 모집글 관련 서버 호출 함수 (목록, 상세, 등록).
// 화면(pages/)은 mocks 를 직접 읽지 않고 항상 이 함수들만 불러요.
// 백엔드가 생기면 함수 안쪽만 fetch('/api/posts') 같은 코드로 바꾸면 돼요.
import { users, posts, postRoles, applications, messages, teamSpaces, ME_ID } from '../../mocks/data'

const userOf = (id) => users.find((u) => u.id === id)

// DB처럼 흩어진 표(posts, post_roles, applications ...)를 화면에서 쓰기 좋은 모양 하나로 합쳐요.
export function toView(post) {
  const roles = postRoles
    .filter((r) => r.postId === post.id)
    .map((r) => {
      const apps = applications.filter((a) => a.roleId === r.id)
      const accepted = apps.filter((a) => a.status === 'ACCEPTED').map((a) => userOf(a.applicantId))
      const members = r.id === post.authorRoleId ? [userOf(post.authorId), ...accepted] : accepted
      return {
        ...r,
        members,
        applications: apps.map((a) => ({
          ...a,
          applicant: userOf(a.applicantId),
          messages: messages.filter((m) => m.applicationId === a.id),
        })),
      }
    })
  const isMember = post.authorId === ME_ID || roles.some((r) => r.members.some((m) => m.id === ME_ID))
  const chatUrl = teamSpaces.find((t) => t.postId === post.id)?.chatUrl
  return {
    ...post,
    author: userOf(post.authorId),
    roles,
    isMember,
    // 팀 채팅 링크는 팀원에게만 보여 줘요
    chatUrl: isMember ? chatUrl : null,
  }
}

// 모집글 목록 (최신순)
export async function getPosts() {
  return [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(toView)
}

// 모집글 하나
export async function getPost(id) {
  const post = posts.find((p) => p.id === id)
  if (!post) throw new Error('모집글을 찾을 수 없어요')
  return toView(post)
}

let seq = 100
// 체험 모드의 새 글 알림: 같은 탭에서 글을 등록하면 구독자에게 알려 줘요
const listeners = new Set()
export function subscribeNewPosts(onPost) {
  listeners.add(onPost)
  return () => { listeners.delete(onPost) }
}
// 모집글 등록. roles: [{ roleCode, capacity, skills }] — 첫 번째 역할은 작성자 본인 자리예요.
export async function createPost({ title, category, description, techStack, deadline, chatUrl, roles }) {
  const id = `p-${seq++}`
  const roleRows = roles.map((r) => ({ id: `r-${id}-${r.roleCode}`, postId: id, ...r }))
  posts.push({
    id, authorId: ME_ID, authorRoleId: roleRows[0].id, category, status: 'OPEN',
    title, description, techStack, deadline, createdAt: new Date().toISOString(),
  })
  postRoles.push(...roleRows)
  teamSpaces.push({ postId: id, chatUrl })
  const post = await getPost(id)
  listeners.forEach((fn) => fn(post))
  return post
}

// 모집 마감 (작성자만). 검토 대기·면담 중인 지원은 선발 종료로 바꿔요. (DB 의 close_post 와 같은 규칙)
export async function closePost(id) {
  const post = posts.find((p) => p.id === id)
  if (!post) throw new Error('모집글을 찾을 수 없어요')
  if (post.authorId !== ME_ID) throw new Error('모집글 작성자만 할 수 있어요')
  if (post.status === 'CLOSED') throw new Error('이미 마감된 모집글이에요')
  post.status = 'CLOSED'
  applications
    .filter((a) => a.postId === id && ['PENDING', 'CHATTING'].includes(a.status))
    .forEach((a) => {
      a.status = 'REJECTED'
      messages.push({
        id: `m-close-${a.id}`, applicationId: a.id, senderId: null,
        body: '모집이 마감되어 선발이 종료되었어요. 다음 도전을 응원해요.', createdAt: new Date().toISOString(),
      })
    })
}

// 배열에서 조건에 맞는 항목을 제자리에서 지워요
const removeWhere = (list, fn) => {
  for (let i = list.length - 1; i >= 0; i--) if (fn(list[i])) list.splice(i, 1)
}

// 모집글 삭제 (작성자만, 지원자가 없을 때만 · 취소한 지원은 세지 않아요). (DB 의 delete_post 와 같은 규칙)
export async function deletePost(id) {
  const post = posts.find((p) => p.id === id)
  if (!post) throw new Error('모집글을 찾을 수 없어요')
  if (post.authorId !== ME_ID) throw new Error('모집글 작성자만 삭제할 수 있어요')
  if (applications.some((a) => a.postId === id && a.status !== 'CANCELED')) {
    throw new Error('지원자가 있는 모집글은 삭제할 수 없어요. 대신 모집을 마감해 주세요')
  }
  const appIds = new Set(applications.filter((a) => a.postId === id).map((a) => a.id))
  removeWhere(messages, (m) => appIds.has(m.applicationId))
  removeWhere(applications, (a) => a.postId === id)
  removeWhere(postRoles, (r) => r.postId === id)
  removeWhere(teamSpaces, (t) => t.postId === id)
  removeWhere(posts, (p) => p.id === id)
}
