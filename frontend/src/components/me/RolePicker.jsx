// 희망 역할 카드 4장. 카드를 누르면 그 역할이 추가되고, 한 번 더 누르면 빠져요.
// 여러 장을 같이 고를 수 있어요. 저장은 바깥 폼의 [저장] 버튼이 해요.
// value: 고른 역할 코드 배열 / onChange: 바뀐 배열을 받아요
import { USER_ROLE } from '../../constants/codes'

export default function RolePicker({ value, onChange, labelledBy }) {
  const toggle = (code) => {
    const next = value.includes(code) ? value.filter((c) => c !== code) : [...value, code]
    // USER_ROLE 순서대로 정리해 두면 '바뀌었는지' 비교가 쉬워요
    onChange(Object.keys(USER_ROLE).filter((c) => next.includes(c)))
  }

  return (
    <div className="role-pick" role="group" aria-labelledby={labelledBy}>
      {Object.entries(USER_ROLE).map(([code, r], i) => {
        const on = value.includes(code)
        return (
          <button key={code} type="button" className={`role-card ${on ? 'on' : ''}`}
            aria-pressed={on} onClick={() => toggle(code)}>
            <span className="no">{String(i + 1).padStart(2, '0')}</span>
            <span className="nm">{r.name}{on && <span aria-hidden="true"> ✓</span>}</span>
            <span className="ds">{r.desc}</span>
          </button>
        )
      })}
    </div>
  )
}
