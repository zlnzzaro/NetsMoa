// 로그인·프로필 사진 관련 함수.
// 프로필 사진은 아직 백엔드 API가 없어서 브라우저(localStorage)에만 저장해요.
// 내 정보(닉네임, 기술스택 등)는 api/users.js 의 getMe() 를 써요.

const PHOTO_KEY = 'net-photo'

// 저장해 둔 내 프로필 사진 (없으면 null)
export async function getMyPhoto() {
  try {
    return localStorage.getItem(PHOTO_KEY)
  } catch {
    // 시크릿 창 등에서는 localStorage 를 못 쓸 수 있어요. 그냥 사진 없이 보여 줘요.
    return null
  }
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

// ── 체험 모드: 로그인 없이 항상 '유진'으로 들어와 있어요 ──
const demoOnly = async () => {
  throw new Error('체험 모드에서는 로그인 없이 유진 계정으로 둘러볼 수 있어요')
}
export const signIn = demoOnly
export const signUp = demoOnly
export const signOut = demoOnly
export const resendSignup = demoOnly
export const isNicknameAvailable = async () => true
export const onAuthChange = () => () => {}
export const hasSession = async () => true
