import { describe, it, expect } from "vitest";
import { seed } from "./seed";
import {
  canApply,
  canDecide,
  isClosed,
  safeUrl,
  dayLeft,
  type Application,
} from "./model";
const app = (overrides: Partial<Application> = {}): Application => ({
  id: "a1",
  post_id: "p1",
  role_id: "r1-0",
  applicant_id: "me",
  skills: ["React"],
  portfolio: "",
  experience: "팀 프로젝트 경험이 있습니다.",
  motivation: "함께 서비스를 만들고 싶어요.",
  status: "PENDING",
  created_at: new Date().toISOString(),
  ...overrides,
});
describe("지원 규칙", () => {
  it("한국 날짜 기준 당일 마감은 D-0이다", () => {
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
    }).format(new Date());
    expect(dayLeft(today)).toBe(0);
  });
  it("모집 중인 역할에 지원할 수 있다", () => {
    const s = seed();
    expect(() => canApply(s.posts[0], "r1-0", "me", [])).not.toThrow();
  });
  it("작성자는 자신의 글에 지원할 수 없다", () =>
    expect(() => canApply(seed().posts[0], "r1-0", "host", [])).toThrow(
      "내가 작성한",
    ));
  it("취소한 지원도 중복 신청할 수 없다", () =>
    expect(() =>
      canApply(seed().posts[0], "r1-0", "me", [app({ status: "CANCELED" })]),
    ).toThrow("이미 지원"));
  it("다른 모집글의 역할과 꽉 찬 역할을 거절한다", () => {
    const p = seed().posts[0];
    expect(() => canApply(p, "r2-0", "me", [])).toThrow("마감");
    p.roles[0].filled = p.roles[0].capacity;
    expect(() => canApply(p, "r1-0", "me", [])).toThrow("마감");
  });
  it("마감일이 지난 모집에는 지원할 수 없다", () => {
    const p = seed().posts[0];
    p.deadline = "2000-01-01";
    expect(() => canApply(p, "r1-0", "me", [])).toThrow("마감");
  });
  it("모든 역할이 차면 모집을 마감한다", () => {
    const p = seed().posts[0];
    p.roles.forEach((r) => (r.filled = r.capacity));
    expect(isClosed(p)).toBe(true);
  });
});
describe("선발 및 링크 규칙", () => {
  it("게시자만 수락할 수 있다", () => {
    const s = seed();
    s.applications = [app()];
    expect(() => canDecide(s, "a1", "me", "ACCEPTED")).toThrow("권한");
    expect(() => canDecide(s, "a1", "host", "ACCEPTED")).not.toThrow();
  });
  it("수락 후에는 취소나 거절로 되돌릴 수 없다", () => {
    const s = seed();
    s.applications = [app({ status: "ACCEPTED" })];
    expect(() => canDecide(s, "a1", "me", "CANCELED")).toThrow("완료");
    expect(() => canDecide(s, "a1", "host", "REJECTED")).toThrow("완료");
  });
  it("정원 초과 수락을 막는다", () => {
    const s = seed();
    s.applications = [app()];
    s.posts[0].roles[0].filled = 2;
    expect(() => canDecide(s, "a1", "host", "ACCEPTED")).toThrow("마감");
  });
  it("게시자가 지원자의 신청을 취소할 수 없다", () => {
    const s = seed();
    s.applications = [app()];
    expect(() => canDecide(s, "a1", "host", "CANCELED")).toThrow("권한");
  });
  it("위험한 링크 스킴을 차단한다", () => {
    expect(safeUrl("javascript:alert(1)")).toBe("");
    expect(safeUrl("data:text/html,test")).toBe("");
    expect(safeUrl("https://open.kakao.com/o/test")).toBe(
      "https://open.kakao.com/o/test",
    );
  });
});
