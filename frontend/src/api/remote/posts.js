// 모집글 (Supabase). 화면용 모양은 mock/posts.js 의 toView 와 똑같이 맞춰요.
import { supabase, unwrap, rpc } from '../../lib/supabase'
import { PROFILE_COLS, toUser, myId } from './common'

const toPost = (p) => ({
  id: p.id, authorId: p.author_id, authorRoleId: p.author_role_id, category: p.category, status: p.status,
  title: p.title, description: p.description, techStack: p.tech_stack, deadline: p.deadline, createdAt: p.created_at,
})
const toRole = (r) => ({ id: r.id, postId: r.post_id, roleCode: r.role_code, capacity: r.capacity, skills: r.skills })
const toApp = (a) => ({
  id: a.id, postId: a.post_id, roleId: a.role_id, applicantId: a.applicant_id,
  message: a.message, status: a.status, createdAt: a.created_at,
})

// 필요한 표를 한 번에 받아요. postId 를 주면 그 글만.
async function load(postId) {
  const me = await myId()
  const only = (q, col) => (postId ? q.eq(col, postId) : q)
  const [posts, roles, apps, users, spaces] = await Promise.all([
    unwrap(only(supabase.from('posts').select('*'), 'id').order('created_at', { ascending: false })),
    unwrap(only(supabase.from('post_roles').select('*'), 'post_id').order('sort')),
    unwrap(only(supabase.from('applications').select('*'), 'post_id').order('created_at')),
    unwrap(supabase.from('profiles').select(PROFILE_COLS)),
    // 팀 채팅 링크는 로그인한 팀원에게만 내려와요 (RLS)
    me ? unwrap(only(supabase.from('team_spaces').select('*'), 'post_id')) : [],
  ])
  return {
    me,
    posts: posts.map(toPost),
    roles: roles.map(toRole),
    apps: apps.map(toApp),
    users: new Map(users.map((u) => [u.id, toUser(u)])),
    spaces: new Map(spaces.map((s) => [s.post_id, s.chat_url])),
  }
}

const UNKNOWN = { id: null, nickname: '알 수 없음', bio: '', skills: [], roles: [] }

function toView(post, db) {
  const userOf = (id) => db.users.get(id) ?? UNKNOWN
  const roles = db.roles
    .filter((r) => r.postId === post.id)
    .map((r) => {
      const apps = db.apps.filter((a) => a.roleId === r.id)
      const accepted = apps.filter((a) => a.status === 'ACCEPTED').map((a) => userOf(a.applicantId))
      const members = r.id === post.authorRoleId ? [userOf(post.authorId), ...accepted] : accepted
      return {
        ...r,
        members,
        applications: apps.map((a) => ({ ...a, applicant: userOf(a.applicantId), messages: [] })),
      }
    })
  const isMember = !!db.me && (post.authorId === db.me || roles.some((r) => r.members.some((m) => m.id === db.me)))
  return {
    ...post,
    author: userOf(post.authorId),
    roles,
    isMember,
    chatUrl: isMember ? db.spaces.get(post.id) ?? null : null,
  }
}

export async function getPosts() {
  const db = await load()
  return db.posts.map((p) => toView(p, db))
}

export async function getPost(id) {
  let db
  try {
    db = await load(id)
  } catch {
    throw new Error('모집글을 찾을 수 없어요')
  }
  if (db.posts.length === 0) throw new Error('모집글을 찾을 수 없어요')
  return toView(db.posts[0], db)
}

export async function createPost({ title, category, description, techStack, deadline, chatUrl, roles }) {
  const id = await rpc('create_post', {
    p: {
      title, category, description, tech_stack: techStack, deadline, chat_url: chatUrl,
      roles: roles.map((r) => ({ role_code: r.roleCode, capacity: r.capacity, skills: r.skills })),
    },
  })
  return getPost(id)
}

// 새 모집글이 올라오면 onPost(화면용 모집글) 를 불러요. 돌려준 함수를 부르면 구독을 끊어요.
// 역할(post_roles)은 같은 트랜잭션에서 들어가서, 알림이 올 때는 이미 읽을 수 있어요.
export function subscribeNewPosts(onPost) {
  const channel = supabase
    .channel(`new-posts-${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, ({ new: row }) => {
      getPost(row.id).then(onPost).catch(() => {})
    })
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}
