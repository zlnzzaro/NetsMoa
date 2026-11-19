export type Status =
  "PENDING" | "CHATTING" | "ACCEPTED" | "REJECTED" | "CANCELED";
export type Profile = {
  id: string;
  nickname: string;
  department: string;
  year: number;
  bio: string;
};
export type Role = {
  id: string;
  name: string;
  capacity: number;
  filled: number;
};
export type Post = {
  id: string;
  author_id: string;
  title: string;
  competition: string;
  category: string;
  description: string;
  competition_url: string;
  hours: number;
  goal: string;
  deadline: string;
  created_at: string;
  closed: boolean;
  roles: Role[];
  color: number;
};
export type Application = {
  id: string;
  post_id: string;
  role_id: string;
  applicant_id: string;
  skills: string[];
  portfolio: string;
  experience: string;
  motivation: string;
  status: Status;
  created_at: string;
};
export type Message = {
  id: string;
  application_id: string;
  sender_id: string | null;
  body: string;
  created_at: string;
  read_at: string | null;
};
export type State = {
  profiles: Profile[];
  posts: Post[];
  applications: Application[];
  messages: Message[];
};
export type PostInput = Omit<
  Post,
  "id" | "author_id" | "created_at" | "closed" | "color" | "roles"
> & { roles: { name: string; capacity: number }[]; openchat_url: string };
export const categories = [
  "전체",
  "개발",
  "디자인",
  "아이디어·기획",
  "영상",
  "기타",
];
export const statusLabels: Record<Status, string> = {
  PENDING: "검토 대기",
  CHATTING: "면담 중",
  ACCEPTED: "합류 확정",
  REJECTED: "선발 종료",
  CANCELED: "신청 취소",
};
export const dayLeft = (date: string) => {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return Math.round(
    (Date.parse(date + "T00:00:00Z") - Date.parse(today + "T00:00:00Z")) /
      86400000,
  );
};
export const isClosed = (p: Post) =>
  p.closed ||
  dayLeft(p.deadline) < 0 ||
  p.roles.every((r) => r.filled >= r.capacity);
export function canApply(
  post: Post,
  roleId: string,
  userId: string,
  applications: Application[],
) {
  if (post.author_id === userId)
    throw new Error("내가 작성한 모집글에는 지원할 수 없어요.");
  if (isClosed(post)) throw new Error("모집이 마감되었어요.");
  if (
    applications.some((a) => a.post_id === post.id && a.applicant_id === userId)
  )
    throw new Error("이미 지원한 모집글이에요. 내 지원 현황을 확인해 주세요.");
  const role = post.roles.find((r) => r.id === roleId);
  if (!role || role.filled >= role.capacity)
    throw new Error("선택한 역할의 모집이 마감되었어요.");
}
export function canDecide(
  state: State,
  id: string,
  actor: string,
  next: Status,
) {
  const a = state.applications.find((a) => a.id === id);
  if (!a) throw new Error("지원 내역이 없어요.");
  const p = state.posts.find((p) => p.id === a.post_id)!;
  if (!["PENDING", "CHATTING"].includes(a.status))
    throw new Error("이미 처리가 완료된 지원이에요.");
  if (next === "CANCELED" ? a.applicant_id !== actor : p.author_id !== actor)
    throw new Error("처리 권한이 없어요.");
  if (!["ACCEPTED", "REJECTED", "CANCELED"].includes(next))
    throw new Error("잘못된 상태 변경이에요.");
  if (
    next === "ACCEPTED" &&
    (p.closed ||
      p.roles.find((r) => r.id === a.role_id)!.filled >=
        p.roles.find((r) => r.id === a.role_id)!.capacity)
  )
    throw new Error("해당 역할은 모집이 마감되었어요.");
  return { application: a, post: p };
}
export function safeUrl(value: string) {
  try {
    const u = new URL(value);
    return ["http:", "https:"].includes(u.protocol) ? u.href : "";
  } catch {
    return "";
  }
}
