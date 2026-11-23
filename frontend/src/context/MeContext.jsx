// 로그인한 나의 정보를 모든 화면에서 꺼내 쓸 수 있게 해 주는 곳.
// 쓰는 법: const { me, isGuest, setPhoto, saveProfile, logout } = useMe()
// 로그인 전에는 me 가 '게스트'(빈 기술스택)라서, 화면은 me.skills 같은 값을 그대로 써도 돼요.
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getMe, updateMe } from '../api/users'
import { getMyPhoto, hasSession, onAuthChange, saveMyPhoto, signOut } from '../api/auth'

const MeContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export const GUEST = { id: 'guest', nickname: '게스트', email: '', studentId: '', bio: '', skills: [], roles: [], photoUrl: null }

async function loadMe() {
  if (!(await hasSession())) return GUEST
  try {
    const info = await getMe()
    // Supabase 는 내 정보에 사진이 같이 오고, 체험 모드는 브라우저에 저장된 사진을 따로 읽어요
    const photoUrl = info.photoUrl !== undefined ? info.photoUrl : await getMyPhoto()
    return { ...info, photoUrl }
  } catch {
    return GUEST
  }
}

export function MeProvider({ children }) {
  const [me, setMe] = useState(null)

  const refreshMe = useCallback(() => loadMe().then(setMe), [])

  useEffect(() => {
    refreshMe()
    // 로그인·로그아웃하면 내 정보를 다시 읽어요
    return onAuthChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') refreshMe()
    })
  }, [refreshMe])

  const setPhoto = async (dataUrl) => {
    await saveMyPhoto(dataUrl)
    setMe((m) => ({ ...m, photoUrl: dataUrl }))
  }

  // 닉네임·소개·기술스택 저장. 저장되면 me 도 바꿔서 상단바 아바타·이름이 바로 바뀌어요
  const saveProfile = async (fields) => {
    const info = await updateMe(fields)
    setMe((m) => ({ ...m, ...info, photoUrl: m.photoUrl }))
    return info
  }

  const logout = async () => {
    await signOut()
    setMe(GUEST)
  }

  // 내 정보를 받아오기 전에는 화면을 그리지 않아요 (아주 짧은 순간)
  if (!me) return null
  return (
    <MeContext.Provider value={{ me, isGuest: me.id === GUEST.id, setPhoto, saveProfile, refreshMe, logout }}>
      {children}
    </MeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMe = () => useContext(MeContext)
