// 프로필 사진 도우미.
// 사진 파일 → 가운데를 정사각형으로 자른 256px JPEG 글자(data URL)
// 이미지가 아니거나 깨진 파일이면 오류로 알려 줘요 (부르는 쪽에서 try/catch).
export function resizePhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('이미지 파일이 아니에요'))
      return
    }
    const reader = new FileReader()
    const img = new Image()
    reader.onload = () => { img.src = reader.result }
    reader.onerror = () => reject(new Error('파일을 읽지 못했어요'))
    img.onload = () => {
      const size = 256
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      const s = Math.min(img.width, img.height)
      canvas.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => reject(new Error('사진을 열지 못했어요'))
    reader.readAsDataURL(file)
  })
}
