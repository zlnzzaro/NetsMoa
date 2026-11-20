// 동그란 프로필. 사진이 있으면 사진, 없으면 이름 한 글자를 색 동그라미에 보여 줘요.
// size: '' | 's' | 'l' | 'xl'
const TONES = [
  ['#f0f0ee', '#1a1a1a'], ['#1a1a1a', '#f8f8f7'], ['#d9eef3', '#0d4a5a'],
  ['#e3f1e3', '#1f5a2c'], ['#f6e1e8', '#7a2843'], ['#e8e3fb', '#3d2a8a'],
]

// 이름이 같으면 항상 같은 색이 나오게 숫자로 바꿔요
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 9973, 0)

export default function Avatar({ user, size = '' }) {
  if (user.photoUrl) {
    return <span className={`av ${size}`}><img src={user.photoUrl} alt="" /></span>
  }
  const name = user.nickname
  const [bg, fg] = TONES[hash(name) % TONES.length]
  const letter = name.length > 2 ? name.slice(1, 2) : name[0] // "박서준" → "서"
  return <span className={`av ${size}`} style={{ '--c': bg, '--ci': fg }}>{letter}</span>
}
