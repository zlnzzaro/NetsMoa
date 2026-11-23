// 백엔드가 완성되기 전까지 쓰는 가짜 데이터.
// 필드 이름과 코드값은 DB 테이블(users, posts, post_roles, applications, team_spaces)에 맞춰 두었어요.
// techStack, deadline, authorRoleId 는 아직 DB에 없는 필드라서 백엔드와 상의가 필요해요.

export const ME_ID = 'u-yujin'

export const users = [
  { id: 'u-yujin', email: 'yujin@example.com', studentId: '2025012345', nickname: '유진', bio: '컴퓨터학부 2학년 · 프론트엔드', skills: ['React', 'JavaScript', 'Figma'] },
  { id: 'u-seojun', nickname: '박서준', bio: '', skills: ['React', 'TypeScript'] },
  { id: 'u-doyun', nickname: '이도윤', bio: '', skills: ['Java', 'Spring Boot'] },
  { id: 'u-harin', nickname: '최하린', bio: '', skills: ['React', 'CSS'] },
  { id: 'u-minjae', nickname: '정민재', bio: '', skills: ['Java', 'Spring Boot'] },
  { id: 'u-jiwoo', nickname: '한지우', bio: '', skills: ['MySQL'] },
  { id: 'u-taeo', nickname: '김태오', bio: '', skills: ['C++'] },
  { id: 'u-seoa', nickname: '윤서아', bio: '', skills: ['Python'] },
  { id: 'u-jimin', nickname: '오지민', bio: '', skills: ['Node.js'] },
  { id: 'u-yuna', nickname: '서유나', bio: '', skills: ['Python'] },
  { id: 'u-hyunwoo', nickname: '강현우', bio: '', skills: ['React'] },
  { id: 'u-hajun', nickname: '임하준', bio: '', skills: [] },
  { id: 'u-chaewon', nickname: '문채원', bio: '', skills: [] },
  { id: 'u-junseo', nickname: '배준서', bio: '', skills: [] },
  { id: 'u-eunbi', nickname: '노은비', bio: '', skills: ['Next.js'] },
  { id: 'u-daeun', nickname: '정다은', bio: '', skills: ['CSS'] },
  { id: 'u-minho', nickname: '황민호', bio: '', skills: ['SQL'] },
  { id: 'u-yerin', nickname: '조예린', bio: '', skills: ['SQL'] },
  { id: 'u-taemin', nickname: '권태민', bio: '', skills: ['Unity'] },
  { id: 'u-jiho', nickname: '신지호', bio: '', skills: ['Python'] },
  { id: 'u-haneul', nickname: '유하늘', bio: '', skills: ['React'] },
  { id: 'u-soyul', nickname: '장소율', bio: '', skills: ['JavaScript'] },
  { id: 'u-hyun', nickname: '남궁현', bio: '', skills: ['Python'] },
]

export const posts = [
  {
    id: 'p-1', authorId: 'u-seojun', authorRoleId: 'r-1-fe', category: 'COMPETITION', status: 'OPEN',
    title: '해커톤 출품용 캠퍼스 중고거래 웹 같이 만들 분',
    description: '2026 컴퓨터학부 해커톤에 낼 캠퍼스 중고거래 웹을 만들어요. 학교 이메일 인증, 거래 채팅, 후기까지 2주 안에 끝내는 게 목표예요.\n\n주 2회 저녁에 온라인으로 모이고, 마지막 주는 오프라인으로 만나요. 처음 해 보는 분도 괜찮아요.',
    techStack: ['React', 'Spring Boot', 'PostgreSQL', 'Figma'], deadline: '2026-11-30', createdAt: '2026-11-20T14:00:00+09:00',
  },
  {
    id: 'p-2', authorId: 'u-taeo', authorRoleId: 'r-2-other', category: 'STUDY', status: 'OPEN',
    title: '백준 골드 목표 알고리즘 스터디', description: '매주 화·목 밤 9시, 디스코드에서 문제 풀이를 공유해요.',
    techStack: ['C++', 'Python'], deadline: '2026-11-25', createdAt: '2026-11-20T11:00:00+09:00',
  },
  {
    id: 'p-3', authorId: 'u-jimin', authorRoleId: 'r-3-be', category: 'SIDE_PROJECT', status: 'OPEN',
    title: '공강 시간 맞춰 주는 시간표 공유 앱', description: '친구들과 시간표를 겹쳐서 같이 비는 시간을 찾아 주는 앱이에요.',
    techStack: ['React', 'Node.js', 'MongoDB'], deadline: '2026-12-05', createdAt: '2026-11-19T18:00:00+09:00',
  },
  {
    id: 'p-4', authorId: 'u-yuna', authorRoleId: 'r-4-ai', category: 'COMPETITION', status: 'OPEN',
    title: '학과 공지 알려 주는 AI 챗봇 공모전', description: '학과 공지사항을 물어보면 답해 주는 챗봇을 만들어요.',
    techStack: ['Python', 'FastAPI', 'React'], deadline: '2026-11-28', createdAt: '2026-11-19T10:00:00+09:00',
  },
  {
    id: 'p-5', authorId: 'u-hajun', authorRoleId: 'r-5-other', category: 'STUDY', status: 'CLOSED',
    title: 'CS 전공 면접 스터디', description: '운영체제, 네트워크, DB 질문으로 모의 면접을 해요.',
    techStack: ['CS 기초'], deadline: '2026-11-22', createdAt: '2026-11-18T10:00:00+09:00',
  },
  {
    id: 'p-6', authorId: 'u-eunbi', authorRoleId: 'r-6-fe', category: 'SIDE_PROJECT', status: 'OPEN',
    title: '동아리 홈페이지 리뉴얼', description: '오래된 동아리 홈페이지를 새로 만들어요. 디자인부터 같이 해요.',
    techStack: ['Figma', 'Next.js'], deadline: '2026-12-10', createdAt: '2026-11-17T10:00:00+09:00',
  },
  {
    id: 'p-7', authorId: 'u-daeun', authorRoleId: 'r-7-fe', category: 'SIDE_PROJECT', status: 'OPEN',
    title: '학교 사이트 웹 접근성 개선', description: '학교 사이트 접근성을 점검하고 개선안을 만들어요.',
    techStack: ['HTML', 'CSS', 'React'], deadline: '2026-12-01', createdAt: '2026-11-17T09:00:00+09:00',
  },
  {
    id: 'p-8', authorId: 'u-minho', authorRoleId: 'r-8-other', category: 'STUDY', status: 'OPEN',
    title: '정보처리기사 실기 스터디', description: '기출을 풀고 서로 채점해요.',
    techStack: ['SQL', 'Java'], deadline: '2026-11-24', createdAt: '2026-11-16T09:00:00+09:00',
  },
  {
    id: 'p-9', authorId: 'u-taemin', authorRoleId: 'r-9-other', category: 'COMPETITION', status: 'OPEN',
    title: '48시간 게임잼 같이 나갈 팀', description: '유니티로 2D 퍼즐 게임을 만들어요.',
    techStack: ['Unity', 'C#', 'Figma'], deadline: '2026-11-27', createdAt: '2026-11-15T09:00:00+09:00',
  },
  {
    id: 'p-10', authorId: 'u-jiho', authorRoleId: 'r-10-be', category: 'SIDE_PROJECT', status: 'OPEN',
    title: '학식 메뉴 알림 봇', description: '매일 아침 학식 메뉴를 보내 주는 봇이에요.',
    techStack: ['Python', 'AWS'], deadline: '2026-12-03', createdAt: '2026-11-14T09:00:00+09:00',
  },
  {
    id: 'p-11', authorId: 'u-haneul', authorRoleId: 'r-11-other', category: 'STUDY', status: 'OPEN',
    title: '리액트 입문 스터디, 처음이어도 괜찮아요', description: '공식 문서를 같이 읽고 작은 앱을 하나씩 만들어요.',
    techStack: ['React', 'JavaScript'], deadline: '2026-11-26', createdAt: '2026-11-13T09:00:00+09:00',
  },
  {
    id: 'p-12', authorId: 'u-hyun', authorRoleId: 'r-12-other', category: 'CAPSTONE', status: 'OPEN',
    title: '졸업작품 IoT 스마트 화분', description: '라즈베리파이로 화분 상태를 앱에서 보여 줘요.',
    techStack: ['Raspberry Pi', 'Flutter'], deadline: '2026-12-15', createdAt: '2026-11-12T09:00:00+09:00',
  },
]

// post_roles: 한 모집글 안에서 role_code 는 겹치면 안 돼요 (DB의 UNIQUE 규칙)
export const postRoles = [
  { id: 'r-1-fe', postId: 'p-1', roleCode: 'FRONTEND', capacity: 2, skills: ['React', 'TypeScript'] },
  { id: 'r-1-be', postId: 'p-1', roleCode: 'BACKEND', capacity: 2, skills: ['Java', 'Spring Boot'] },
  { id: 'r-1-design', postId: 'p-1', roleCode: 'DESIGN', capacity: 1, skills: ['Figma'] },
  { id: 'r-2-other', postId: 'p-2', roleCode: 'OTHER', capacity: 4, skills: ['C++', 'Python'] },
  { id: 'r-3-fe', postId: 'p-3', roleCode: 'FRONTEND', capacity: 1, skills: ['React', 'JavaScript'] },
  { id: 'r-3-be', postId: 'p-3', roleCode: 'BACKEND', capacity: 1, skills: ['Node.js'] },
  { id: 'r-4-ai', postId: 'p-4', roleCode: 'AI', capacity: 2, skills: ['Python'] },
  { id: 'r-4-fe', postId: 'p-4', roleCode: 'FRONTEND', capacity: 1, skills: ['React'] },
  { id: 'r-5-other', postId: 'p-5', roleCode: 'OTHER', capacity: 3, skills: [] },
  { id: 'r-6-design', postId: 'p-6', roleCode: 'DESIGN', capacity: 1, skills: ['Figma'] },
  { id: 'r-6-fe', postId: 'p-6', roleCode: 'FRONTEND', capacity: 2, skills: ['Next.js', 'React'] },
  { id: 'r-7-fe', postId: 'p-7', roleCode: 'FRONTEND', capacity: 2, skills: ['React', 'CSS'] },
  { id: 'r-8-other', postId: 'p-8', roleCode: 'OTHER', capacity: 4, skills: ['SQL'] },
  { id: 'r-9-other', postId: 'p-9', roleCode: 'OTHER', capacity: 2, skills: ['Unity', 'C#'] },
  { id: 'r-9-design', postId: 'p-9', roleCode: 'DESIGN', capacity: 1, skills: ['Figma'] },
  { id: 'r-10-be', postId: 'p-10', roleCode: 'BACKEND', capacity: 1, skills: ['Python'] },
  { id: 'r-10-fe', postId: 'p-10', roleCode: 'FRONTEND', capacity: 1, skills: ['React', 'JavaScript'] },
  { id: 'r-11-other', postId: 'p-11', roleCode: 'OTHER', capacity: 5, skills: ['React', 'JavaScript'] },
  { id: 'r-12-fe', postId: 'p-12', roleCode: 'FRONTEND', capacity: 1, skills: ['Flutter'] },
  { id: 'r-12-other', postId: 'p-12', roleCode: 'OTHER', capacity: 1, skills: ['Python'] },
]

// applications: 상태가 ACCEPTED 인 지원자가 곧 팀원이에요
export const applications = [
  { id: 'a-1', postId: 'p-1', roleId: 'r-1-fe', applicantId: 'u-harin', message: 'React로 개인 블로그를 만들어 봤어요.', status: 'PENDING', createdAt: '2026-11-20T15:00:00+09:00' },
  { id: 'a-2', postId: 'p-1', roleId: 'r-1-be', applicantId: 'u-doyun', message: 'Spring Boot 해 봤어요.', status: 'ACCEPTED', createdAt: '2026-11-20T14:10:00+09:00' },
  { id: 'a-3', postId: 'p-1', roleId: 'r-1-be', applicantId: 'u-minjae', message: 'Spring Boot로 REST API 과제를 해 봤어요.', status: 'CHATTING', createdAt: '2026-11-20T14:30:00+09:00' },
  { id: 'a-4', postId: 'p-1', roleId: 'r-1-be', applicantId: 'u-jiwoo', message: 'DB 설계를 좋아해요.', status: 'CANCELED', createdAt: '2026-11-20T14:40:00+09:00' },
  { id: 'a-5', postId: 'p-2', roleId: 'r-2-other', applicantId: 'u-seoa', message: '골드 찍고 싶어요.', status: 'ACCEPTED', createdAt: '2026-11-20T12:00:00+09:00' },
  { id: 'a-6', postId: 'p-4', roleId: 'r-4-fe', applicantId: 'u-hyunwoo', message: '프론트 맡을게요.', status: 'ACCEPTED', createdAt: '2026-11-19T11:00:00+09:00' },
  { id: 'a-7', postId: 'p-5', roleId: 'r-5-other', applicantId: 'u-chaewon', message: '면접 준비 중이에요.', status: 'ACCEPTED', createdAt: '2026-11-18T11:00:00+09:00' },
  { id: 'a-8', postId: 'p-5', roleId: 'r-5-other', applicantId: 'u-junseo', message: '같이 해요.', status: 'ACCEPTED', createdAt: '2026-11-18T12:00:00+09:00' },
  { id: 'a-9', postId: 'p-8', roleId: 'r-8-other', applicantId: 'u-yerin', message: '실기 준비해요.', status: 'ACCEPTED', createdAt: '2026-11-16T10:00:00+09:00' },
  { id: 'a-10', postId: 'p-11', roleId: 'r-11-other', applicantId: 'u-soyul', message: '처음이에요!', status: 'ACCEPTED', createdAt: '2026-11-13T10:00:00+09:00' },
]

// 1:1 면담 채팅 메시지 (지원서 하나 = 채팅방 하나)
export const messages = [
  { id: 'm-1', applicationId: 'a-3', senderId: 'u-seojun', body: '안녕하세요! 지원 고마워요. JPA 써 보셨어요?', createdAt: '2026-11-20T14:35:00+09:00' },
  { id: 'm-2', applicationId: 'a-3', senderId: 'u-minjae', body: '네, 과제에서 조금 써 봤어요. JdbcClient는 처음이에요.', createdAt: '2026-11-20T14:37:00+09:00' },
]

// team_spaces: 팀 채팅 링크는 합류가 확정된 사람에게만 보여 줘요
export const teamSpaces = [
  { postId: 'p-1', chatUrl: 'https://discord.gg/campus-market' },
  { postId: 'p-2', chatUrl: 'https://open.kakao.com/o/algo-study' },
  { postId: 'p-3', chatUrl: 'https://discord.gg/timetable' },
  { postId: 'p-4', chatUrl: 'https://discord.gg/notice-bot' },
  { postId: 'p-5', chatUrl: 'https://open.kakao.com/o/cs-interview' },
  { postId: 'p-6', chatUrl: 'https://discord.gg/club-web' },
  { postId: 'p-7', chatUrl: 'https://discord.gg/a11y' },
  { postId: 'p-8', chatUrl: 'https://open.kakao.com/o/jeongcheo' },
  { postId: 'p-9', chatUrl: 'https://discord.gg/gamejam' },
  { postId: 'p-10', chatUrl: 'https://discord.gg/menu-bot' },
  { postId: 'p-11', chatUrl: 'https://open.kakao.com/o/react-101' },
  { postId: 'p-12', chatUrl: 'https://discord.gg/smart-pot' },
]
