// DB에 저장되는 코드값과 화면에 보여 줄 한글 이름을 짝지어 둔 파일.
// 코드값은 백엔드(posts.category, post_roles.role_code, applications.status)와 똑같이 맞춰야 해요.

export const CATEGORY = {
  COMPETITION: '공모전',
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

// 첫 화면 '내 기술스택으로 찾아보기'에 보여 줄 기술 목록
export const PICKABLE_SKILLS = ['React', 'JavaScript', 'Spring Boot', 'Python', 'Figma', 'Node.js', 'Flutter', 'C++']
