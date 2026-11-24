// remote/* 에서 같이 쓰는 도우미
import { supabase } from '../../lib/supabase'

// 다른 사람에게 공개되는 프로필 칼럼 (학번·이메일은 빠져 있어요)
export const PROFILE_COLS = 'id, nickname, bio, skills, roles, photo_url'

export const toUser = (u) => ({
  id: u.id, nickname: u.nickname, bio: u.bio, skills: u.skills ?? [], roles: u.roles ?? [], photoUrl: u.photo_url,
})

// 로그인한 내 id (로그아웃 상태면 null). 브라우저에 저장된 세션을 읽어서 빨라요.
export async function myId() {
  const { data } = await supabase.auth.getSession()
  return data.session?.user.id ?? null
}
