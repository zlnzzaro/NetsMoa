// 상세 화면의 역할 한 줄: 역할 이름, 인원, 자리(사람/빈 자리), 오른쪽에 지원 버튼이나 내 상태.
import Avatar from '../common/Avatar'
import StatusBadge from '../common/StatusBadge'
import SkillChips from '../common/SkillChips'
import { isMatch, isOpen, pad2, roleLabel } from '../../utils/post'
import { useMe } from '../../context/MeContext'

export default function RoleRow({ post, role, index, onApply, onCancel, onChat }) {
  const { me } = useMe()
  const matched = isMatch(role, me.skills)
  const full = role.members.length >= role.capacity
  // 이 역할에 낸 내 지원서 (취소 안 한 것 우선)
  const mine = role.applications.filter((a) => a.applicantId === me.id)
  const myApp = mine.find((a) => a.status !== 'CANCELED') ?? mine[0]

  let action
  if (role.members.some((m) => m.id === me.id)) {
    action = <StatusBadge status="ACCEPTED" />
  } else if (myApp && myApp.status !== 'CANCELED') {
    action = (
      <>
        <StatusBadge status={myApp.status} />
        {myApp.status === 'CHATTING' && <button className="btn s" onClick={() => onChat(myApp)}>면담 채팅</button>}
        {['PENDING', 'CHATTING'].includes(myApp.status) && (
          <button className="btn s" onClick={() => onCancel(myApp)}>신청 취소</button>
        )}
      </>
    )
  } else if (full || !isOpen(post)) {
    action = <span className="tag off">마감</span>
  } else {
    action = (
      <>
        {myApp && <StatusBadge status="CANCELED" />}
        <button className="btn p" onClick={() => onApply(role)}>지원하기</button>
      </>
    )
  }

  return (
    <div className="rrow2">
      <span className="idx" style={{ paddingTop: 5 }}>{pad2(index + 1)}</span>
      <div>
        <div className="role-head">
          <h3>{roleLabel(role, post)}</h3>
          <span className="cap">{role.members.length}/{role.capacity}명</span>
          {matched && <span className="tag m">내 스택과 매칭</span>}
        </div>
        <SkillChips className="rs" skills={role.skills} highlight={me.skills} />
        <div className="seats">
          {role.members.map((m) => (
            <span className="seat" key={m.id}><Avatar user={m.id === me.id ? me : m} size="s" />{m.nickname}</span>
          ))}
          {Array.from({ length: Math.max(0, role.capacity - role.members.length) }, (_, i) => (
            <span key={i} className={`seat e ${matched ? 'hl' : ''}`}>빈 자리</span>
          ))}
        </div>
      </div>
      <div className="act">{action}</div>
    </div>
  )
}
