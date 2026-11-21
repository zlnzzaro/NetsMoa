// 역할에 지원할 때 뜨는 창. 한 줄 소개만 쓰면 돼요.
import { useState } from 'react'
import { isMatch, roleLabel } from '../../utils/post'
import { useMe } from '../../context/MeContext'

export default function ApplyModal({ post, role, onSubmit, onClose }) {
  const { me } = useMe()
  const [intro, setIntro] = useState('React로 학과 과제 웹을 만들어 봤어요. 열심히 할게요.')

  const submit = (e) => {
    e.preventDefault()
    onSubmit(intro.trim() || '잘 부탁드려요.')
  }

  return (
    // 바깥 어두운 부분을 누르면 닫혀요
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <form className="modal" onSubmit={submit}>
        <div>
          <p className="cap">{post.title}</p>
          <h2 style={{ fontSize: 20, marginTop: 6 }}>{roleLabel(role, post)} 역할에 지원</h2>
        </div>
        {isMatch(role, me.skills) && <span className="tag m" style={{ justifySelf: 'start' }}>내 기술스택과 맞는 역할이에요</span>}
        <div style={{ display: 'grid', gap: 6 }}>
          <label htmlFor="a-intro" className="cap">한 줄 소개</label>
          <input className="inp" id="a-intro" maxLength={60} autoFocus value={intro} onChange={(e) => setIntro(e.target.value)} />
        </div>
        <p className="cap">지원하면 검토 대기 상태가 돼요. 작성자가 면담을 요청하면 1:1 채팅이 열려요.</p>
        <div className="pair">
          <button type="button" className="btn s" onClick={onClose}>취소</button>
          <button className="btn p">지원하기</button>
        </div>
      </form>
    </div>
  )
}
