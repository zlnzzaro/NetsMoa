// 흐릿한 색 번짐 위에 작은 화면 조각을 띄우는 장식.
// 색은 이 장식 안에만 써요 (디자인 규칙). kind 로 어떤 조각을 보여 줄지 골라요.
const KINDS = {
  apply: {
    c1: '#2f9e5a', c2: '#c9f0a8', ang: 118,
    body: <>
      <span className="cap">프론트엔드 · 1/2</span>
      <span className="t">한 줄 소개</span>
      <span className="bub">React로 과제 웹 만들어 봤어요</span>
      <div className="row"><span className="mini s">취소</span><span className="mini">지원하기</span></div>
    </>,
  },
  chat: {
    c1: '#00a2c7', c2: '#bfe9ff', ang: 150,
    body: <>
      <span className="cap">면담 · 두 사람만 봐요</span>
      <span className="bub">JPA 써 보셨어요?</span>
      <span className="bub me">네, 과제에서 조금요</span>
    </>,
  },
  seats: {
    c1: '#e7799b', c2: '#ffd9e6', ang: 100,
    body: <>
      <span className="cap">디자인 · 0/1</span>
      <span className="t">빈 자리 1</span>
      <div className="row start"><span className="seat" /><span className="seat" /><span className="seat e" /></div>
      <span className="cap">3자리 중 2자리 찼어요</span>
    </>,
  },
  match: {
    c1: '#8a6cf0', c2: '#e2d9ff', ang: 135,
    body: <>
      <span className="cap">내 기술스택</span>
      <div className="row start"><span className="mini">React</span><span className="mini s">Figma</span></div>
      <span className="t">맞는 빈자리 5개</span>
    </>,
  },
  full: {
    c1: '#e0a43a', c2: '#ffecc2', ang: 112,
    body: <>
      <span className="cap">모집 상태</span>
      <span className="t">정원이 다 차서 마감됐어요</span>
      <div className="row"><span className="cap">팀 채팅 링크</span><span className="mini">열기</span></div>
    </>,
  },
  team: {
    c1: '#0052ff', c2: '#cfe0ff', ang: 128,
    body: <>
      <span className="cap">합류 확정</span>
      <span className="t">팀원 5명</span>
      <div className="row start">{[1, 2, 3, 4, 5].map((n) => <span key={n} className="seat" />)}</div>
    </>,
  },
}

export default function Vignette({ kind, width = 280 }) {
  const k = KINDS[kind]
  return (
    <div className="vg" aria-hidden="true"
      style={{ '--c1': k.c1, '--c2': k.c2, '--ang': `${k.ang}deg`, '--w': `${width}px` }}>
      <span className="tex" />
      <div className="pane">{k.body}</div>
    </div>
  )
}
