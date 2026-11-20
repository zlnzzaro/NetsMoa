// 작성자 화면에서 지원자 한 명을 보여 주는 줄 + 면담/확정/종료 버튼.
import Avatar from '../common/Avatar'
import StatusBadge from '../common/StatusBadge'
import SkillChips from '../common/SkillChips'
import { useMe } from '../../context/MeContext'

export default function ApplicantRow({ application: a, roleFull, onAction }) {
  const { me } = useMe()
  const isMe = a.applicantId === me.id

  let buttons = null
  if (a.status === 'PENDING' || a.status === 'CHATTING') {
    buttons = (
      <>
        {a.status === 'PENDING'
          ? <button className="btn s" disabled={roleFull} onClick={() => onAction('chat', a)}>면담하기</button>
          : <button className="btn s" onClick={() => onAction('openChat', a)}>채팅 열기</button>}
        <button className="btn p" disabled={roleFull} onClick={() => onAction('accept', a)}>합류 확정</button>
        <button className="btn s" onClick={() => onAction('reject', a)}>선발 종료</button>
      </>
    )
  } else if (a.status === 'ACCEPTED' || a.status === 'REJECTED') {
    buttons = <button className="btn s" onClick={() => onAction('undo', a)}>되돌리기</button>
  }

  return (
    <div className="ap">
      <Avatar user={isMe ? me : a.applicant} size="l" />
      <div style={{ minWidth: 0 }}>
        <div className="nm">
          {a.applicant.nickname}
          {isMe && <span className="tag m">나</span>}
          <StatusBadge status={a.status} />
        </div>
        <p>{a.message}</p>
        <SkillChips className="stk" skills={a.applicant.skills} />
      </div>
      <div className="acts">{buttons}</div>
    </div>
  )
}
