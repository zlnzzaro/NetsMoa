// DB에 저장되는 코드값과 화면에 보여 줄 한글 이름을 짝지어 둔 파일.
// 코드값은 백엔드(posts.category, post_roles.role_code, applications.status)와 똑같이 맞춰야 해요.

export const CATEGORY = {
  COMPETITION: '공모전',
  HACKATHON: '해커톤',
  CAPSTONE: '캡스톤',
  STUDY: '스터디',
  SIDE_PROJECT: '사이드 프로젝트',
}

export const ROLE = {
  FRONTEND: '프론트엔드',
  BACKEND: '백엔드',
  AI: 'AI',
  DESIGN: '디자인',
  PRESENTATION: '발표',
  OTHER: '기타',
}

// 내 정보의 '희망 역할' (여러 개 고를 수 있어요)
// 모집글 역할(ROLE)과 따로 둬요. 겹치는 코드(FRONTEND, BACKEND, DESIGN)는 이름을 똑같이 맞춰 두었어요.
// DB users 테이블에는 아직 이 칸이 없어서 백엔드에 추가를 요청해야 해요.
export const USER_ROLE = {
  FRONTEND: { name: '프론트엔드', desc: '화면과 사용자 경험을 만들어요' },
  BACKEND: { name: '백엔드', desc: '서버·DB·API를 만들어요' },
  PM: { name: 'PM', desc: '일정과 방향을 정리해요' },
  DESIGN: { name: '디자인', desc: '화면 구성과 디자인을 맡아요' },
}

// 지원 상태 5단계
export const APPLICATION_STATUS = {
  PENDING: '검토 대기',
  CHATTING: '면담 중',
  ACCEPTED: '합류 확정',
  REJECTED: '선발 종료',
  CANCELED: '신청 취소',
}

// 아직 결정이 안 난(진행 중인) 상태
export const ACTIVE_STATUSES = ['PENDING', 'CHATTING']

// 내 정보 '정보 수정'에서 상자로 고를 기술 목록 (분야별)
// 여기에 없는 기술은 화면에서 직접 추가할 수 있어요. 이름은 모집글 기술스택과 똑같이 적어야 매칭돼요.
export const SKILL_GROUPS = [
  { name: '언어', skills: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Kotlin', 'Swift', 'Go'] },
  { name: '프론트엔드', skills: ['React', 'Vue', 'Next.js', 'HTML', 'CSS', 'Tailwind CSS'] },
  { name: '백엔드', skills: ['Spring Boot', 'Node.js', 'Express', 'Django', 'FastAPI'] },
  { name: '앱·게임', skills: ['Flutter', 'React Native', 'Android', 'iOS', 'Unity'] },
  { name: '데이터·AI', skills: ['SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'PyTorch', 'TensorFlow'] },
  { name: '디자인·협업', skills: ['Figma', 'Git', 'Docker', 'AWS'] },
]

// 내 기술스택은 10개까지 (DB users.skills 의 CHECK cardinality(skills) <= 10 과 맞춤)
export const MAX_SKILLS = 10

// 첫 화면 '내 기술스택으로 찾아보기'에 보여 줄 기술 목록
export const PICKABLE_SKILLS = ['React', 'JavaScript', 'Spring Boot', 'Python', 'Figma', 'Node.js', 'Flutter', 'C++']
