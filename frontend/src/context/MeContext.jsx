// 로그인한 나(유진)의 정보를 모든 화면에서 꺼내 쓸 수 있게 해 주는 곳.
// 쓰는 법: const { me, setPhoto, saveProfile } = useMe()
import { createContext, useContext, useEffect, useState } from 'react'
import { getMe, updateMe } from '../api/users'
import { getMyPhoto, saveMyPhoto } from '../api/auth'

const MeContext = createContext(null)

export function MeProvider({ children }) {
  const [me, setMe] = useState(null)

  useEffect(() => {
    // 내 정보(서버)와 프로필 사진(브라우저)을 함께 받아서 하나로 합쳐요
    Promise.all([getMe(), getMyPhoto()]).then(([info, photoUrl]) => setMe({ ...info, photoUrl }))
  }, [])

  const setPhoto = async (dataUrl) => {
    await saveMyPhoto(dataUrl)
    setMe((m) => ({ ...m, photoUrl: dataUrl }))
  }

  // 닉네임·소개·기술스택 저장. 저장되면 me 도 바꿔서 상단바 아바타·이름이 바로 바뀌어요
  const saveProfile = async (fields) => {
    const info = await updateMe(fields)
    setMe((m) => ({ ...m, ...info }))
    return info
  }

  // 내 정보를 받아오기 전에는 화면을 그리지 않아요 (아주 짧은 순간)
  if (!me) return null
  return <MeContext.Provider value={{ me, setPhoto, saveProfile }}>{children}</MeContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export const useMe = () => useContext(MeContext)
