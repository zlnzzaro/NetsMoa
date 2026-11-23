// 오른쪽에서 열리는 1:1 면담 채팅. 지원자와 작성자 두 사람만 봐요.
// viewer: 지금 화면을 보는 사람, other: 상대방
// Supabase 연결 시: 실시간으로 상대 메시지를 받아요. 체험 모드: 상대 답장을 1.1초 뒤 자동으로 넣어요.
import { useEffect, useRef, useState } from 'react'
import Avatar from '../common/Avatar'
import Icon from '../common/Icon'
import { getMessages, sendMessage, subscribeMessages } from '../../api/applications'
import { isDemoMode } from '../../lib/supabase'
import { useToast } from '../../context/ToastContext'
import { APPLICATION_STATUS } from '../../constants/codes'

const AUTO_REPLY = {
  author: '좋아요! 이번 주 목요일 저녁 회의에 같이 들어와 보실래요?',
  applicant: '네, 편한 시간 알려 주시면 맞춰 볼게요.',
}

export default function ChatDrawer({ application, roleName, viewer, other, viewerIsAuthor, onClose }) {
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const list = useRef(null)
  const toast = useToast()
  const ended = ['REJECTED', 'CANCELED'].includes(application.status)

  const refresh = () => getMessages(application.id).then(setMsgs)

  useEffect(() => {
    refresh()
    // 새 메시지가 오면 다시 읽어요 (실시간 연결 + 혹시 끊겼을 때를 위한 5초 확인)
    const stop = subscribeMessages(application.id, refresh)
    const timer = isDemoMode ? null : setInterval(refresh, 5000)
    return () => { stop(); clearInterval(timer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application.id])
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
    try {
      await sendMessage(application.id, viewer.id, body)
    } catch (err) {
      setText(body)
      toast(err.message)
      return
    }
    refresh()
    if (isDemoMode) setTimeout(async () => {
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
          {msgs.map((m) => (m.senderId
            ? <div key={m.id} className={`msg ${m.senderId === viewer.id ? 'me' : ''}`}>{m.body}</div>
            : <p key={m.id} className="sys">{m.body}</p>))}
        </div>
        <form className="dr-f" onSubmit={send}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={ended ? '끝난 면담이에요' : '메시지 입력'}
            autoComplete="off" autoFocus disabled={ended} maxLength={1000} />
          <button className="btn p" disabled={ended}>보내기</button>
        </form>
      </aside>
    </>
  )
}
