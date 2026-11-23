// 기술스택 고르기. 분야별 기술 상자를 누르면 추가되고, 한 번 더 누르면 빠져요.
// 목록에 없는 기술은 아래 입력칸에서 직접 추가해요. 직접 추가한 기술은 '직접 추가' 줄에 상자로 보여요.
// 10개(MAX_SKILLS)를 고르면 나머지 상자와 직접 추가가 잠겨요. 고른 걸 빼면 다시 풀려요.
// 저장은 바깥 폼의 [저장] 버튼이 해요.
// value: 고른 기술 배열 (고른 순서대로) / onChange: 바뀐 배열을 받아요
import { useState } from 'react'
import { SKILL_GROUPS, MAX_SKILLS } from '../../constants/codes'

const LISTED = SKILL_GROUPS.flatMap((g) => g.skills)
const MAX_LEN = 20 // 직접 추가하는 기술 이름 최대 길이

export default function SkillPicker({ value, onChange, labelledBy }) {
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('') // 직접 추가할 때 안내 문구

  const full = value.length >= MAX_SKILLS

  const toggle = (skill) => onChange(value.includes(skill) ? value.filter((s) => s !== skill) : [...value, skill])

  const add = () => {
    const name = text.trim()
    if (!name) return
    if (name.length > MAX_LEN) return setMsg(`${MAX_LEN}자까지 적을 수 있어요`)
    // 대소문자만 다른 이름(react, REACT)은 이미 있는 이름으로 맞춰요
    const same = [...LISTED, ...value].find((s) => s.toLowerCase() === name.toLowerCase())
    const skill = same || name
    if (value.includes(skill)) {
      setMsg(`${skill}은(는) 이미 골랐어요`)
    } else if (full) {
      setMsg(`${MAX_SKILLS}개까지 고를 수 있어요`)
    } else {
      onChange([...value, skill])
      setMsg('')
    }
    setText('')
  }

  // 입력칸에서 Enter: 폼 전체가 저장되지 않게 막고 기술만 추가해요 (한글 입력 중인 Enter 는 무시)
  const onKeyDown = (e) => {
    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
    e.preventDefault()
    add()
  }

  const custom = value.filter((s) => !LISTED.includes(s))
  const groups = custom.length > 0 ? [...SKILL_GROUPS, { name: '직접 추가', skills: custom }] : SKILL_GROUPS

  const box = (skill) => {
    const on = value.includes(skill)
    return (
      <button key={skill} type="button" className={`skill-box ${on ? 'on' : ''}`}
        aria-pressed={on} disabled={full && !on} onClick={() => toggle(skill)}>
        {skill}{on && <span aria-hidden="true"> ✓</span>}
      </button>
    )
  }

  return (
    <div className="skill-pick" role="group" aria-labelledby={labelledBy}>
      {groups.map((g) => (
        <div key={g.name} className="skill-group">
          <span className="gname">{g.name}</span>
          <div className="boxes">{g.skills.map(box)}</div>
        </div>
      ))}
      <div className="skill-add">
        <input className="inp" value={text} disabled={full} maxLength={MAX_LEN + 10} aria-label="기술 직접 추가"
          placeholder={full ? `${MAX_SKILLS}개를 모두 골랐어요` : '목록에 없는 기술 (예: Svelte)'}
          onChange={(e) => { setText(e.target.value); setMsg('') }} onKeyDown={onKeyDown} />
        <button type="button" className="btn s" onClick={add} disabled={full || !text.trim()}>추가</button>
      </div>
      {msg && <small className="bad" role="alert">{msg}</small>}
    </div>
  )
}
