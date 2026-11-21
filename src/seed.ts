import type { State, Post } from "./model";
const future = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
export function seed(): State {
  const titles = [
    "캠퍼스의 불편함을 바꿀, 우리만의 서비스",
    "좋은 아이디어를 멋진 브랜드로 함께 만들어요",
    "데이터로 발견하는 우리 동네의 새로운 가능성",
    "60초 안에 담는 우리의 캠퍼스 이야기",
    "환경을 위한 작은 실천, 큰 아이디어",
    "처음이어도 괜찮아, 같이 해커톤 나가요",
  ];
  const comps = [
    "2026 캠퍼스 이노베이션 챌린지",
    "대학생 브랜드 디자인 공모전",
    "공공데이터 활용 아이디어 공모전",
    "대학 생활 숏폼 영상 공모전",
    "그린 캠퍼스 아이디어 챌린지",
    "겨울방학 대학생 해커톤",
  ];
  const cats = [
    "개발",
    "디자인",
    "아이디어·기획",
    "영상",
    "아이디어·기획",
    "개발",
  ];
  const roles = [
    ["프론트엔드", "UI/UX 디자인"],
    ["브랜딩", "그래픽 디자인"],
    ["데이터 분석", "서비스 기획"],
    ["영상 편집", "촬영"],
    ["서비스 기획", "디자인"],
    ["백엔드", "프론트엔드"],
  ];
  const desc = [
    "학생들의 일상 속 작은 불편을 해결하는 서비스를 만들고 있어요. 현재 기획자와 백엔드 개발자가 함께하고 있습니다. 사용자 인터뷰부터 실제 서비스 배포까지, 함께 고민하고 만들어 갈 동료를 찾습니다.\n\n매주 수요일 저녁 온라인 미팅을 진행하고, 시험 기간에는 일정을 유연하게 조율해요. 결과만큼 함께 배우는 과정도 중요하게 생각합니다.",
    "지역의 이야기를 담은 브랜드를 만들어 볼 팀원을 찾아요. 서로의 시안을 존중하며 아이디어를 자유롭게 나눌 수 있으면 좋겠습니다.",
    "공공데이터 속 숨은 인사이트를 찾아 실제로 도움이 되는 서비스로 제안하려고 해요. 데이터 분석을 좋아하는 분과 함께하고 싶어요.",
    "우리가 사랑하는 캠퍼스의 순간을 짧은 영상으로 담아요. 촬영부터 편집까지 함께 즐겁게 만들어 봐요.",
    "일상에서 실천할 수 있는 친환경 아이디어를 구체화합니다. 다양한 전공의 시선을 환영해요.",
    "수상 경험이 없어도 괜찮아요. 방학 동안 작지만 완성된 서비스를 만들어 보려 합니다. 서로 배우며 끝까지 함께해요.",
  ];
  const posts: Post[] = titles.map((title, i) => ({
    id: `p${i + 1}`,
    author_id: i === 0 ? "host" : `u${i + 1}`,
    title,
    competition: comps[i],
    category: cats[i],
    description: desc[i],
    competition_url: "https://www.knu.ac.kr",
    hours: [8, 6, 5, 4, 3, 10][i],
    goal: i === 4 || i === 5 ? "경험·성장" : "수상 도전",
    deadline: future([5, 12, 3, 18, 10, 24][i]),
    created_at: new Date(Date.now() - i * 3600000).toISOString(),
    closed: false,
    color: i,
    roles: roles[i].map((name, j) => ({
      id: `r${i + 1}-${j}`,
      name,
      capacity: j === 0 ? 2 : 1,
      filled: i === 2 && j === 1 ? 1 : 0,
    })),
  }));
  return {
    profiles: [
      {
        id: "me",
        nickname: "김모아",
        department: "컴퓨터학부",
        year: 3,
        bio: "함께 만들고 배우는 걸 좋아해요.",
      },
      {
        id: "host",
        nickname: "이지원",
        department: "컴퓨터학부",
        year: 3,
        bio: "아이디어를 실제 서비스로 만들어요.",
      },
      ...["박서연", "정도윤", "최하은", "강민준", "윤수빈"].map(
        (nickname, i) => ({
          id: `u${i + 2}`,
          nickname,
          department: [
            "시각디자인학과",
            "통계학과",
            "미디어커뮤니케이션학과",
            "경영학부",
            "컴퓨터학부",
          ][i],
          year: 3,
          bio: "함께 도전해요!",
        }),
      ),
    ],
    posts,
    applications: [],
    messages: [],
  };
}
