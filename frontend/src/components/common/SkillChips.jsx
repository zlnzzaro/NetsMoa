// 기술스택을 기술마다 작은 칩(태그)으로 보여 줘요.
// skills: ['React', 'Java'] 같은 배열
// highlight: 강조할 기술 배열 (예: 내 기술스택). 여기에 있는 기술은 진한 칩으로 보여요.
export default function SkillChips({ skills, highlight = [], className = '' }) {
  if (!skills || skills.length === 0) return null
  return (
    <ul className={`chips ${className}`} aria-label="기술스택">
      {skills.map((s) => {
        const hit = highlight.includes(s)
        return (
          <li key={s} className={`chip ${hit ? 'hit' : ''}`}>
            {s}
            {hit && <span className="sr-only"> (내 스택)</span>}
          </li>
        )
      })}
    </ul>
  )
}
