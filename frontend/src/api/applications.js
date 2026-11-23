// 지원·면담·승인 관련 서버 호출 함수.
// 상태 5단계: PENDING(검토 대기) → CHATTING(면담 중) → ACCEPTED(합류 확정)
//            REJECTED(선발 종료), CANCELED(신청 취소)
import { isDemoMode } from '../lib/supabase'
import * as mock from './mock/applications'
import * as remote from './remote/applications'

export const {
  apply, cancel, startChat, sendMessage, getMessages, subscribeMessages, accept, reject, undo,
} = isDemoMode ? mock : remote
