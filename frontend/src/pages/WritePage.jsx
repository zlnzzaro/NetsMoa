// 모집글 쓰기 (주소: /write)
// 역할은 DB 코드(FRONTEND, BACKEND ...) 중에서 고르고, 한 글 안에서 같은 역할은 한 번만 쓸 수 있어요.
// 첫 번째 역할은 작성자 본인 자리로 들어가요.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/common/Icon'
import { createPost } from '../api/posts'
import { CATEGORY, ROLE } from '../constants/codes'
import { useToast } from '../context/ToastContext'

const splitComma = (s) => s.split(',').map((x) => x.trim()).filter(Boolean)
let rowKey = 0
const newRow = (roleCode = '', capacity = 1, skills = '') => ({ key: rowKey++, roleCode, capacity, skills })

export default function WritePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ title: '', category: 'SIDE_PROJECT', description: '', techStack: '', deadline: '', chatUrl: '' })
  const [rows, setRows] = useState([newRow('FRONTEND', 2, 'React'), newRow('BACKEND', 1, 'Spring Boot')])
  const [error, setError] = useState('')

  // form 값 하나 바꾸기: set('title')(이벤트)
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })
  const setRow = (key, field, value) => setRows(rows.map((r) => (r.key === key ? { ...r, [field]: value } : r)))

  const submit = async (e) => {
    e.preventDefault()
    const roles = rows.filter((r) => r.roleCode)
    if (!form.title.trim()) return setError('제목을 입력해 주세요.')
    if (roles.length === 0) return setError('역할을 하나 이상 골라 주세요.')
    if (new Set(roles.map((r) => r.roleCode)).size !== roles.length) return setError('같은 역할이 두 번 들어갔어요. 인원 수로 조절해 주세요.')

    const post = await createPost({
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim() || '소개가 아직 없어요.',
      techStack: splitComma(form.techStack),
      deadline: form.deadline || null,
      chatUrl: form.chatUrl.trim() || 'https://discord.gg/my-team',
      roles: roles.map((r) => ({ roleCode: r.roleCode, capacity: Math.max(1, Number(r.capacity) || 1), skills: splitComma(r.skills) })),
    })
    toast('모집글을 등록했어요')
    navigate(`/posts/${post.id}`)
  }

  return (
    <div className="frame page">
      <Link className="back" to="/"><Icon name="left" />목록</Link>
      <div className="intro">
        <h1 className="display">같이 할 사람을 찾아요</h1>
        <p className="statement">역할마다 몇 명이 필요한지 적으면 지원자가 역할을 골라 지원해요. 인원이 다 차면 자동으로 마감돼요.</p>
      </div>

      <form className="form" onSubmit={submit} noValidate>
        <div className="frow">
          <label htmlFor="w-title">제목</label>
          <input className="inp" id="w-title" value={form.title} onChange={set('title')} placeholder="예: 해커톤 같이 나갈 백엔드 구해요" />
        </div>

        <div className="frow">
          <span className="lab">분류</span>
          <div className="seg">
            {Object.entries(CATEGORY).map(([code, label]) => (
              <button type="button" key={code} className={form.category === code ? 'on' : ''}
                onClick={() => setForm({ ...form, category: code })}>{label}</button>
            ))}
          </div>
        </div>

        <div className="frow">
          <label htmlFor="w-desc">소개</label>
          <textarea className="inp" id="w-desc" value={form.description} onChange={set('description')} placeholder="무엇을 만드는지, 언제 어떻게 모이는지 적어 주세요" />
        </div>

        <div className="frow">
          <span className="lab">역할과 인원</span>
          <div>
            <div className="rrows">
              {rows.map((r) => (
                <div className="rrow" key={r.key}>
                  <select className="inp" value={r.roleCode} aria-label="역할" onChange={(e) => setRow(r.key, 'roleCode', e.target.value)}>
                    <option value="">역할 고르기</option>
                    {Object.entries(ROLE).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                  </select>
                  <input className="inp" type="number" min="1" max="10" aria-label="인원" value={r.capacity} onChange={(e) => setRow(r.key, 'capacity', e.target.value)} />
                  <input className="inp rs" placeholder="원하는 기술스택" aria-label="원하는 기술스택" value={r.skills} onChange={(e) => setRow(r.key, 'skills', e.target.value)} />
                  <button type="button" className="icon-btn" aria-label="역할 삭제"
                    onClick={() => rows.length > 1 && setRows(rows.filter((x) => x.key !== r.key))}><Icon name="x" /></button>
                </div>
              ))}
            </div>
            <button type="button" className="btn s" style={{ marginTop: 8 }} onClick={() => setRows([...rows, newRow()])}>
              <Icon name="plus" />역할 추가
            </button>
            <small>첫 번째 역할은 내 자리예요. 기술스택은 쉼표로 나눠 적어요.</small>
          </div>
        </div>

        <div className="frow">
          <label htmlFor="w-stack">기술스택</label>
          <input className="inp" id="w-stack" value={form.techStack} onChange={set('techStack')} placeholder="React, Spring Boot, PostgreSQL" />
        </div>
        <div className="frow">
          <label htmlFor="w-dead">마감일</label>
          <input className="inp" id="w-dead" type="date" style={{ maxWidth: 200 }} value={form.deadline} onChange={set('deadline')} />
        </div>
        <div className="frow">
          <label htmlFor="w-chat">팀 채팅 링크</label>
          <div>
            <input className="inp" id="w-chat" value={form.chatUrl} onChange={set('chatUrl')} placeholder="디스코드 또는 카카오톡 오픈채팅 링크" />
            <small>합류가 확정된 팀원에게만 보여요.</small>
          </div>
        </div>

        {error && <p className="err">{error}</p>}
        <div className="pair form-foot">
          <button className="btn p">등록하기</button>
          <Link className="btn s" to="/">취소</Link>
        </div>
      </form>
    </div>
  )
}
