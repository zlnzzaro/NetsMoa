// 모집글 작성자에게만 보이는 "모집 마감 / 글 삭제" 버튼.
// 지원자가 있으면(취소한 지원은 빼고) 삭제는 막고 마감만 할 수 있어요.
// 실제 권한·조건 검사는 서버(DB 함수 close_post, delete_post)가 한 번 더 해요.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { closePost, deletePost } from '../../api/posts'
import { useToast } from '../../context/ToastContext'

const CONFIRM = {
  close: {
    title: '모집을 마감할까요?',
    body: '더 이상 지원을 받지 않아요. 검토 대기·면담 중인 지원자는 선발 종료로 바뀌고, 다시 열 수 없어요.',
    ok: '마감하기',
  },
  delete: {
    title: '모집글을 삭제할까요?',
    body: '글과 역할, 팀 채팅 링크가 모두 지워지고 되돌릴 수 없어요.',
    ok: '삭제하기',
  },
}

export default function PostOwnerActions({ post, onChanged }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [ask, setAsk] = useState(null) // 'close' | 'delete' | null
  const [busy, setBusy] = useState(false)

  const applicants = post.roles.reduce(
    (n, r) => n + r.applications.filter((a) => a.status !== 'CANCELED').length, 0)
  const canDelete = applicants === 0
  const closed = post.status === 'CLOSED'

  const run = async () => {
    setBusy(true)
    try {
      if (ask === 'close') {
        await closePost(post.id)
        toast('모집을 마감했어요')
        setAsk(null)
        onChanged()
      } else {
        await deletePost(post.id)
        toast('모집글을 삭제했어요')
        navigate('/board', { replace: true })
      }
    } catch (err) {
      toast(err.message)
      setAsk(null)
      onChanged()
    } finally {
      setBusy(false)
    }
  }

  const c = ask && CONFIRM[ask]
  return (
    <div className="owner-acts">
      <span className="cap">내 모집글 관리</span>
      <div className="pair">
        {!closed && <button type="button" className="btn s" onClick={() => setAsk('close')}>모집 마감</button>}
        <button type="button" className="btn s danger-text" disabled={!canDelete} onClick={() => setAsk('delete')}>
          글 삭제
        </button>
      </div>
      {!canDelete && (
        <p className="cap">
          지원자가 {applicants}명 있어서 삭제할 수 없어요.{!closed && ' 대신 모집을 마감할 수 있어요.'}
        </p>
      )}

      {c && (
        <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget && !busy) setAsk(null) }}>
          <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="oa-title" aria-describedby="oa-body">
            <div>
              <p className="cap">{post.title}</p>
              <h2 id="oa-title" style={{ fontSize: 20, marginTop: 6 }}>{c.title}</h2>
            </div>
            <p id="oa-body" className="cap">{c.body}</p>
            <div className="pair">
              <button type="button" className="btn s" onClick={() => setAsk(null)} disabled={busy} autoFocus>취소</button>
              <button type="button" className={`btn ${ask === 'delete' ? 'danger' : 'p'}`} onClick={run} disabled={busy}>
                {busy ? '처리 중…' : c.ok}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
