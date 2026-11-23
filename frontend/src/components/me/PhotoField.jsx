// 내 정보 화면의 '프로필 사진' 줄. 동그란 사진 + 사진 바꾸기 / 사진 지우기.
// 저장 버튼 없이 바로 저장되고, 상단바 아바타도 함께 바뀌어요 (MeContext 의 setPhoto).
import Avatar from '../common/Avatar'
import { useMe } from '../../context/MeContext'
import { useToast } from '../../context/ToastContext'
import { resizePhoto } from '../../utils/photo'

export default function PhotoField() {
  const { me, setPhoto } = useMe()
  const toast = useToast()

  const onPick = async (e) => {
    const file = e.target.files[0]
    e.target.value = '' // 같은 파일을 다시 골라도 동작하게 비워 둬요
    if (!file) return
    try {
      await setPhoto(await resizePhoto(file))
      toast('프로필 사진을 바꿨어요')
    } catch {
      toast('사진을 불러오지 못했어요. 다른 사진을 골라 주세요')
    }
  }

  const onRemove = async () => {
    await setPhoto(null)
    toast('기본 프로필로 돌아갔어요')
  }

  return (
    <div className="frow">
      <span className="lab">프로필 사진</span>
      <div>
        <Avatar user={me} size="xxl" />
        <div className="pair" style={{ marginTop: 12 }}>
          {/* label 을 누르면 아래 숨겨진 파일 선택 칸이 열려요 */}
          <label className="btn s" htmlFor="photoInput" style={{ cursor: 'pointer' }}>사진 바꾸기</label>
          {me.photoUrl && <button className="btn s" onClick={onRemove}>사진 지우기</button>}
        </div>
        <small>정사각형으로 잘라서 저장해요</small>
        <input type="file" id="photoInput" accept="image/*" hidden onChange={onPick} />
      </div>
    </div>
  )
}
