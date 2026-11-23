// 로그인·회원가입·프로필 사진 관련 함수.
import { isDemoMode } from '../lib/supabase'
import * as mock from './mock/auth'
import * as remote from './remote/auth'

export const {
  signIn, signUp, signOut, isNicknameAvailable, onAuthChange, hasSession, getMyPhoto, saveMyPhoto,
} = isDemoMode ? mock : remote
