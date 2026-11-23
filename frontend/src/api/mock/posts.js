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
  return getPost(id)
}
