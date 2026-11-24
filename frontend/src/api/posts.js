// 모집글 관련 서버 호출 함수 (목록, 상세, 등록).
// 화면(pages/)은 항상 이 파일의 함수만 불러요.
// Supabase 설정이 있으면 remote/, 없으면 체험용 mock/ 을 써요. (lib/supabase.js 참고)
import { isDemoMode } from '../lib/supabase'
import * as mock from './mock/posts'
import * as remote from './remote/posts'

export const { getPosts, getPost, createPost, subscribeNewPosts } = isDemoMode ? mock : remote
