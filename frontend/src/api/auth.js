// 로그인·프로필 관련 서버 호출 함수.
// 지금은 mock 데이터를 써요. 백엔드가 생기면 이 파일 안쪽만 fetch로 바꾸면 돼요.
import { users, ME_ID } from '../mocks/data'

const PHOTO_KEY = 'net-photo'

// 지금 로그인한 사람 정보
export async function getMe() {
  const me = users.find((u) => u.id === ME_ID)
  let photoUrl = null
  try {
    photoUrl = localStorage.getItem(PHOTO_KEY)
  } catch {
    // 시크릿 창 등에서는 localStorage 를 못 쓸 수 있어요. 그냥 사진 없이 보여 줘요.
  }
  return { ...me, photoUrl }
}

// 프로필 사진 저장 (지금은 브라우저에만 저장. 나중엔 서버 업로드로 바꿔요)
export async function saveMyPhoto(dataUrl) {
  try {
    if (dataUrl) localStorage.setItem(PHOTO_KEY, dataUrl)
    else localStorage.removeItem(PHOTO_KEY)
  } catch {
    // 저장이 안 돼도 이번 화면에서는 보이도록 그냥 넘어가요.
  }
  return dataUrl
}
