import { createClient } from "@supabase/supabase-js";
import { seed } from "./seed";
import {
  canApply,
  canDecide,
  safeUrl,
  type State,
  type PostInput,
  type Application,
  type Status,
  type Profile,
} from "./model";
export const schoolDomain = import.meta.env.VITE_SCHOOL_DOMAIN || "knu.ac.kr";
export const supabase =
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    ? createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
      )
    : null;
export const demo = !supabase;
const key = "moa-demo-v1";
type DemoData = State & { links: Record<string, string> };
function read(): DemoData {
  try {
    const d = localStorage.getItem(key);
    if (d) return JSON.parse(d);
  } catch {}
  return { ...seed(), links: {} };
}
function write(d: DemoData) {
  localStorage.setItem(key, JSON.stringify(d));
  window.dispatchEvent(new Event("moa-change"));
}
const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
async function rpc(name: string, args: Record<string, unknown> = {}) {
  const { data, error } = await supabase!.rpc(name, args);
  if (error) throw new Error(error.message);
  return data;
}
export const api = {
  async load(): Promise<State> {
    if (demo) {
      const { links, ...state } = read();
      return state;
    }
    return rpc("load_state");
  },
  async saveProfile(profile: Profile) {
    if (!demo) return rpc("save_profile", { p_data: profile });
    const d = read();
    d.profiles = d.profiles.map((p) => (p.id === profile.id ? profile : p));
    write(d);
  },
  async savePost(actor: string, input: PostInput, id?: string) {
    if (!safeUrl(input.competition_url) || !safeUrl(input.openchat_url))
      throw new Error("올바른 사이트 주소를 입력해 주세요.");
    if (!/^https:\/\/open\.kakao\.com\//.test(input.openchat_url))
      throw new Error(
        "https://open.kakao.com/ 으로 시작하는 오픈채팅 주소를 입력해 주세요.",
      );
    if (!demo) return rpc("save_post", { p_data: input, p_id: id || null });
    const d = read();
    const existing = d.posts.find((p) => p.id === id);
    if (existing && existing.author_id !== actor)
      throw new Error("수정 권한이 없어요.");
    if (existing && d.applications.some((a) => a.post_id === id))
      throw new Error("지원자가 있는 글은 모집 마감만 가능해요.");
    const postId = id || uid();
    const { openchat_url, roles, ...rest } = input;
    const post = {
      ...rest,
      id: postId,
      author_id: actor,
      created_at: existing?.created_at || now(),
      closed: false,
      color: existing?.color ?? d.posts.length % 6,
      roles: roles.map((r) => ({ ...r, id: uid(), filled: 0 })),
    };
    d.posts = existing
      ? d.posts.map((p) => (p.id === id ? post : p))
      : [post, ...d.posts];
    d.links[postId] = openchat_url;
    write(d);
    return postId;
  },
  async managePost(actor: string, id: string, action: "close" | "delete") {
    if (!demo) return rpc("manage_post", { p_id: id, p_action: action });
    const d = read();
    const p = d.posts.find((p) => p.id === id);
    if (p?.author_id !== actor) throw new Error("권한이 없어요.");
    if (action === "delete") {
      if (d.applications.some((a) => a.post_id === id))
        throw new Error(
          "지원 내역이 있는 글은 삭제할 수 없어요. 모집 마감을 이용해 주세요.",
        );
      d.posts = d.posts.filter((p) => p.id !== id);
      delete d.links[id];
    } else p.closed = true;
    write(d);
  },
  async apply(
    actor: string,
    data: Omit<Application, "id" | "applicant_id" | "status" | "created_at">,
  ) {
    if (!demo) return rpc("apply_to_post", { p_data: data });
    const d = read();
    const p = d.posts.find((p) => p.id === data.post_id)!;
    canApply(p, data.role_id, actor, d.applications);
    const id = uid();
    d.applications.push({
      ...data,
      id,
      applicant_id: actor,
      status: "PENDING",
      created_at: now(),
    });
    d.messages.push({
      id: uid(),
      application_id: id,
      sender_id: null,
      body: "지원이 완료되었어요. 이 공간에서 서로의 기대와 일정을 나누어 보세요.",
      created_at: now(),
      read_at: null,
    });
    write(d);
    return id;
  },
  async decide(actor: string, id: string, status: Status) {
    if (!demo) return rpc("decide_application", { p_id: id, p_status: status });
    const d = read();
    const { application: a, post: p } = canDecide(d, id, actor, status);
    a.status = status;
    if (status === "ACCEPTED") {
      p.roles.find((r) => r.id === a.role_id)!.filled++;
      if (p.roles.every((r) => r.filled >= r.capacity)) p.closed = true;
    }
    d.messages.push({
      id: uid(),
      application_id: id,
      sender_id: null,
      body:
        status === "ACCEPTED"
          ? "팀 합류가 확정되었어요! 상단의 팀 오픈채팅 버튼에서 입장할 수 있어요."
          : status === "CANCELED"
            ? "지원자가 신청을 취소했어요."
            : "이번 모집의 선발이 종료되었어요. 다음 도전을 응원합니다.",
      created_at: now(),
      read_at: null,
    });
    write(d);
  },
  async send(actor: string, id: string, body: string) {
    if (!body.trim()) return;
    if (!demo) return rpc("send_message", { p_id: id, p_body: body });
    const d = read();
    const a = d.applications.find((a) => a.id === id)!;
    const p = d.posts.find((p) => p.id === a.post_id)!;
    if (![a.applicant_id, p.author_id].includes(actor))
      throw new Error("참여한 면담만 볼 수 있어요.");
    if (["REJECTED", "CANCELED"].includes(a.status))
      throw new Error("종료된 면담이에요.");
    d.messages.push({
      id: uid(),
      application_id: id,
      sender_id: actor,
      body: body.trim(),
      created_at: now(),
      read_at: null,
    });
    if (a.status === "PENDING") a.status = "CHATTING";
    write(d);
  },
  async markRead(actor: string, id: string) {
    if (!demo) return rpc("mark_read", { p_id: id });
    const d = read();
    let changed = false;
    d.messages.forEach((m) => {
      if (m.application_id === id && m.sender_id !== actor && !m.read_at) {
        m.read_at = now();
        changed = true;
      }
    });
    if (changed) write(d);
  },
  async teamLink(actor: string, id: string): Promise<string | null> {
    if (!demo) return rpc("get_team_link", { p_id: id });
    const d = read();
    const p = d.posts.find((p) => p.id === id)!;
    if (
      p.author_id !== actor &&
      !d.applications.some(
        (a) =>
          a.post_id === id &&
          a.applicant_id === actor &&
          a.status === "ACCEPTED",
      )
    )
      throw new Error("합류가 확정된 팀원만 확인할 수 있어요.");
    return d.links[id] || null;
  },
};
