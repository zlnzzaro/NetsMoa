// 지원·면담·승인 (Supabase). 권한 검사와 상태 규칙은 DB 함수(RPC)가 맡아요.
import { supabase, unwrap, rpc } from '../../lib/supabase'

export const apply = (postId, roleId, message) =>
  rpc('apply_to_role', { p_post: postId, p_role: roleId, p_message: message })

export const cancel = (applicationId) => rpc('cancel_application', { p_app: applicationId })

// 두 번째 인자(authorId)는 mock 과 모양을 맞추려고 받기만 해요. 보내는 사람은 서버가 로그인 정보로 정해요.
export const startChat = (applicationId) => rpc('start_chat', { p_app: applicationId })

export const sendMessage = (applicationId, _senderId, body) =>
  rpc('send_message', { p_app: applicationId, p_body: body })

export async function getMessages(applicationId) {
  const rows = await unwrap(
    supabase.from('messages').select('*').eq('application_id', applicationId).order('created_at').order('id'),
  )
  return rows.map((m) => ({
    id: m.id, applicationId: m.application_id, senderId: m.sender_id, body: m.body, createdAt: m.created_at,
  }))
}

// 새 메시지가 오면 onChange 를 불러요. 돌려주는 함수를 부르면 구독을 끊어요.
export function subscribeMessages(applicationId, onChange) {
  const channel = supabase
    .channel(`messages-${applicationId}-${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `application_id=eq.${applicationId}` },
      onChange)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

export const accept = (applicationId) => rpc('accept_application', { p_app: applicationId })
export const reject = (applicationId) => rpc('reject_application', { p_app: applicationId })
export const undo = (applicationId) => rpc('undo_application', { p_app: applicationId })
