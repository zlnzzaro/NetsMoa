// 모집글 화면에서 자주 쓰는 계산 함수 모음.
// api/posts.js 가 돌려주는 "화면용 모집글" 모양을 기준으로 해요.
import { ROLE, CATEGORY } from '../constants/codes'

// 역할 하나에 이미 들어온 인원 수 (작성자 + 합류 확정된 사람)
export const filledOf = (role) => role.members.length

// 모집글 전체 정원과 찬 인원
export const totalOf = (post) => post.roles.reduce((sum, r) => sum + r.capacity, 0)
export const filledTotalOf = (post) => post.roles.reduce((sum, r) => sum + r.members.length, 0)
export const percentOf = (post) => Math.round((filledTotalOf(post) / totalOf(post)) * 100)

// 아직 지원을 받을 수 있는 모집글인지
export const isOpen = (post) => post.status === 'OPEN' && filledTotalOf(post) < totalOf(post)

// 이 역할이 원하는 기술 중 하나라도 내 기술스택에 있으면 '매칭'
export const isMatch = (role, mySkills) => role.skills.some((s) => mySkills.includes(s))

// 화면에 보여 줄 역할 이름. 스터디의 '기타' 역할은 '스터디원'으로 보여 줘요.
export const roleLabel = (role, post) =>
  post?.category === 'STUDY' && role.roleCode === 'OTHER' ? '스터디원' : ROLE[role.roleCode]

export const categoryLabel = (code) => CATEGORY[code]

// 1 → "01"
export const pad2 = (n) => String(n).padStart(2, '0')

// "2026-11-30" → "11.30"
export const shortDate = (iso) => (iso ? iso.slice(5, 10).replace('-', '.') : '미정')

// 작성 시각을 "2시간 전", "어제" 처럼 바꿔요. 일주일이 넘으면 날짜로 보여 줘요.
export function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 0 || diff > 7 * 24 * 3600) return shortDate(iso)
  if (diff < 60) return '방금'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 24 * 3600) return `${Math.floor(diff / 3600)}시간 전`
  if (diff < 48 * 3600) return '어제'
  return `${Math.floor(diff / 86400)}일 전`
}
