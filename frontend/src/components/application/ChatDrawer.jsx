// 오른쪽에서 열리는 1:1 면담 채팅. 지원자와 작성자 두 사람만 봐요.
// viewer: 지금 화면을 보는 사람, other: 상대방
// 지금은 상대 답장을 1.1초 뒤 자동으로 넣어요 (시연용). 실제 채팅은 백엔드 연결 후에.
import { useEffect, useRef, useState } from 'react'
import Avatar from '../common/Avatar'
import Icon from '../common/Icon'
import { getMessages, sendMessage } from '../../api/applications'
import { APPLICATION_STATUS } from '../../constants/codes'

const AUTO_REPLY = {
  author: '좋아요! 이번 주 목요일 저녁 회의에 같이 들어와 보실래요?',
  applicant: '네, 편한 시간 알려 주시면 맞춰 볼게요.',
}

export default function ChatDrawer({ application, roleName, viewer, other, viewerIsAuthor, onClose }) {
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const list = useRef(null)

  const refresh = () => getMessages(application.id).then(setMsgs)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refresh() }, [application.id])
  // 새 메시지가 오면 맨 아래로 스크롤
  useEffect(() => { list.current.scrollTop = list.current.scrollHeight }, [msgs])
  // Esc 로 닫기
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const send = async (e) => {
    e.preventDefault()
    const body = text.trim()
    if (!body) return
    setText('')
    await sendMessage(application.id, viewer.id, body)
    refresh()
    setTimeout(async () => {
      await sendMessage(application.id, other.id, viewerIsAuthor ? AUTO_REPLY.author : AUTO_REPLY.applicant)
      refresh()
    }, 1100)
  }

  return (
    <>
      <div className="drawer-ov" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label="면담 채팅">
        <div className="dr-h">
          <Avatar user={other} />
          <div>
            <span style={{ fontSize: 14.5 }}>{other.nickname}</span>
            <small>{viewerIsAuthor ? `${roleName} 지원자` : '모집글 작성자'} · {APPLICATION_STATUS[application.status]}</small>
          </div>
          <button className="x" onClick={onClose} aria-label="닫기"><Icon name="x" /></button>
        </div>
        <div className="msgs" ref={list}>
          <p className="sys">{roleName} 지원 면담 · 두 사람만 볼 수 있어요</p>
          {msgs.map((m) => (
            <div key={m.id} className={`msg ${m.senderId === viewer.id ? 'me' : ''}`}>{m.body}</div>
          ))}
        </div>
        <form className="dr-f" onSubmit={send}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="메시지 입력" autoComplete="off" autoFocus />
          <button className="btn p">보내기</button>
        </form>
      </aside>
    </>
  )
}
