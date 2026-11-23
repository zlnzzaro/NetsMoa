// 내 정보(회원) 관련 서버 호출 함수.
import { isDemoMode } from '../lib/supabase'
import * as mock from './mock/users'
import * as remote from './remote/users'

export const { getMe, updateMe, changePassword } = isDemoMode ? mock : remote
