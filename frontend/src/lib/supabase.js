// Supabase 연결. frontend/.env.local 에 아래 두 값이 있으면 실제 DB를 쓰고,
// 없으면 mocks/data.js 의 가짜 데이터로 돌아가는 '체험 모드'가 돼요.
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=공개(anon / publishable) 키
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// 가입을 허용할 학교 이메일 도메인 (DB 의 school_email.sql 과 같아야 해요)
export const SCHOOL_DOMAIN = (import.meta.env.VITE_SCHOOL_DOMAIN || 'knu.ac.kr').toLowerCase()
export const isSchoolEmail = (email) => email.trim().toLowerCase().endsWith(`@${SCHOOL_DOMAIN}`)

// 인증 메일 링크로 돌아왔는지 기억해 둬요. (Supabase 가 주소의 #토큰을 읽고 지우기 전에 확인)
//   성공: #access_token=...&type=signup   실패: #error=...&error_code=otp_expired
function readAuthRedirect() {
  if (typeof window === 'undefined') return null
  const p = new URLSearchParams(window.location.hash.slice(1) || window.location.search.slice(1))
  if (p.get('error_code') || p.get('error')) return { ok: false, code: p.get('error_code') || p.get('error') }
  if (p.get('access_token') || p.get('code')) return { ok: true, type: p.get('type') }
  return null
}
export const authRedirect = readAuthRedirect()

export const supabase = url && key ? createClient(url, key) : null
export const isDemoMode = !supabase

// Supabase 오류 → 화면에서 쓰는 Error (err.status 로 구분: 409 중복, 400 입력 오류, 401 로그인 필요)
const STATUS = { 23505: 409, 22023: 400, 23514: 400, 28000: 401, '22P02': 404 }
export function toError(error) {
  const err = new Error(error.message || '요청을 처리하지 못했어요')
  err.status = STATUS[error.code] ?? error.status ?? 500
  err.code = error.code
  return err
}

// 결과의 error 를 확인하고 data 만 돌려줘요
export async function unwrap(promise) {
  const { data, error } = await promise
  if (error) throw toError(error)
  return data
}

// RPC 호출: rpc('accept_application', { p_app: id })
export const rpc = (name, args) => unwrap(supabase.rpc(name, args))

// 발표 시연에 쓰는 대표 모집글 ('캠퍼스 중고거래 웹'). seed.sql 의 md5('p-1')::uuid 와 같아요.
export const DEMO_POST_ID = isDemoMode ? 'p-1' : '70ff8372-8fb2-701c-bc52-fac8df762bf1'
