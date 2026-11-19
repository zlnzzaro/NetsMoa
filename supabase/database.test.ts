import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
let db: PGlite;
const host = "00000000-0000-0000-0000-000000000001",
  student = "00000000-0000-0000-0000-000000000002",
  other = "00000000-0000-0000-0000-000000000003",
  unverified = "00000000-0000-0000-0000-000000000004";
let postId: string,
  roleId: string,
  applicationId: string,
  otherApplicationId: string;
const rpc = async (name: string, args: unknown[] = []) => {
  const placeholders = args.map((_, i) => `$${i + 1}`).join(",");
  return (
    await db.query<Record<string, unknown>>(
      `select public.${name}(${placeholders}) as value`,
      args,
    )
  ).rows[0].value;
};
const actor = async (id: string, role = "authenticated") => {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
  await db.exec(`set role ${role}`);
};
const input = {
  title: "데이터베이스 권한 검증용 팀 모집",
  competition: "테스트 공모전",
  category: "개발",
  description:
    "지원과 수락 과정의 정원 관리 및 권한을 검증하는 테스트 모집글입니다.",
  competition_url: "https://www.knu.ac.kr",
  openchat_url: "https://open.kakao.com/o/test-only",
  hours: 5,
  goal: "경험·성장",
  deadline: "2099-12-31",
  roles: [{ name: "프론트엔드", capacity: 1 }],
};
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role supabase_auth_admin;
 create schema auth; create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth to anon,authenticated;
 grant execute on function auth.uid() to anon,authenticated;`);
  const sql = readFileSync(
    new URL("./migrations/001_initial.sql", import.meta.url),
    "utf8",
  )
    .replace("create extension if not exists pgcrypto;", "")
    .replace(/alter publication supabase_realtime add table[^;]+;/, "");
  await db.exec(sql);
  await db.query(
    "insert into auth.users values($1,'host@knu.ac.kr',now()),($2,'student@knu.ac.kr',now()),($3,'other@knu.ac.kr',now()),($4,'unverified@knu.ac.kr',null)",
    [host, student, other, unverified],
  );
}, 30000);
afterAll(async () => await db.close());
describe.sequential("실제 PostgreSQL 스키마·RLS·RPC", () => {
  it("학교 밖 이메일 계정 생성을 서버에서 거절한다", async () => {
    await expect(
      db.query(
        "insert into auth.users values(gen_random_uuid(),'outsider@example.com',now())",
      ),
    ).rejects.toThrow("학교 이메일");
  });
  it("미인증 학교 이메일로 쓰기 작업을 할 수 없다", async () => {
    await actor(unverified);
    await expect(
      rpc("save_post", [JSON.stringify(input), null]),
    ).rejects.toThrow("인증된");
  });
  it("학교 인증된 모집자가 모집글을 생성한다", async () => {
    await actor(host);
    postId = (await rpc("save_post", [JSON.stringify(input), null])) as string;
    const state = (await rpc("load_state")) as any;
    roleId = state.posts[0].roles[0].id;
    expect(state.posts[0].title).toBe(input.title);
    expect(state.posts[0].openchat_url).toBeUndefined();
  });
  it("공개 조회에 비밀 링크와 지원 이력이 포함되지 않는다", async () => {
    await actor("", "anon");
    const state = (await rpc("load_state")) as any;
    expect(state.posts).toHaveLength(1);
    expect(state.applications).toHaveLength(0);
    await expect(db.query("select * from public.post_secrets")).rejects.toThrow(
      "permission denied",
    );
  });
  it("본인 글 지원과 직접 테이블 쓰기를 거절한다", async () => {
    await actor(host);
    await expect(
      rpc("apply_to_post", [
        JSON.stringify({ post_id: postId, role_id: roleId }),
      ]),
    ).rejects.toThrow("내가 작성한");
    await expect(
      db.query("update public.posts set closed=true"),
    ).rejects.toThrow("permission denied");
  });
  it("지원서를 생성하고 중복 신청과 수락 전 링크 조회를 막는다", async () => {
    await actor(student);
    const a = {
      post_id: postId,
      role_id: roleId,
      skills: ["React"],
      portfolio: "",
      experience: "웹 개발 팀 프로젝트 경험이 있습니다.",
      motivation: "끝까지 함께 개발하고 싶습니다.",
    };
    applicationId = (await rpc("apply_to_post", [JSON.stringify(a)])) as string;
    await expect(rpc("apply_to_post", [JSON.stringify(a)])).rejects.toThrow(
      "이미 지원",
    );
    await expect(rpc("get_team_link", [postId])).rejects.toThrow("확정");
    expect(
      (await db.query("select * from public.post_secrets")).rows,
    ).toHaveLength(0);
  });
  it("제3자는 지원서·메시지를 볼 수 없으며 면담에 쓸 수 없다", async () => {
    await actor(other);
    expect(
      (await db.query("select * from public.applications")).rows,
    ).toHaveLength(0);
    expect((await db.query("select * from public.messages")).rows).toHaveLength(
      0,
    );
    await expect(
      rpc("send_message", [applicationId, "임의 접근"]),
    ).rejects.toThrow("참여한");
    otherApplicationId = (await rpc("apply_to_post", [
      JSON.stringify({
        post_id: postId,
        role_id: roleId,
        skills: ["React"],
        portfolio: "",
        experience: "다양한 팀 프로젝트 경험이 있습니다.",
        motivation: "팀에 도움이 되고 싶습니다.",
      }),
    ])) as string;
  });
  it("메시지 발송이 면담 상태로 바뀌고 상대가 읽으면 표시된다", async () => {
    await actor(student);
    await rpc("send_message", [
      applicationId,
      "안녕하세요. 매주 수요일 저녁 참여 가능합니다.",
    ]);
    expect(
      (
        await db.query<any>(
          "select status from public.applications where id=$1",
          [applicationId],
        )
      ).rows[0].status,
    ).toBe("CHATTING");
    await actor(host);
    await rpc("mark_read", [applicationId]);
    expect(
      (
        await db.query<any>(
          "select read_at from public.messages where sender_id=$1",
          [student],
        )
      ).rows[0].read_at,
    ).not.toBeNull();
  });
  it("지원자가 생긴 뒤 모집 조건 수정·삭제를 막는다", async () => {
    await actor(host);
    await expect(
      rpc("save_post", [JSON.stringify(input), postId]),
    ).rejects.toThrow("지원자가");
    await expect(rpc("manage_post", [postId, "delete"])).rejects.toThrow(
      "지원 내역",
    );
  });
  it("지원자가 자신을 수락할 수 없다", async () => {
    await actor(student);
    await expect(
      rpc("decide_application", [applicationId, "ACCEPTED"]),
    ).rejects.toThrow("권한");
  });
  it("수락하면 정원이 증가하고 전체 모집이 자동 마감된다", async () => {
    await actor(host);
    await rpc("decide_application", [applicationId, "ACCEPTED"]);
    const state = (await rpc("load_state")) as any;
    expect(state.posts[0].roles[0].filled).toBe(1);
    expect(state.posts[0].closed).toBe(true);
  });
  it("마지막 자리를 초과해 수락할 수 없다", async () => {
    await actor(host);
    await expect(
      rpc("decide_application", [otherApplicationId, "ACCEPTED"]),
    ).rejects.toThrow("마감");
  });
  it("수락된 지원자만 링크를 조회하고 수락 취소는 불가능하다", async () => {
    await actor(student);
    expect(await rpc("get_team_link", [postId])).toBe(input.openchat_url);
    expect(
      (await db.query("select * from public.post_secrets")).rows,
    ).toHaveLength(1);
    await expect(
      rpc("decide_application", [applicationId, "CANCELED"]),
    ).rejects.toThrow("완료");
    await actor(other);
    await expect(rpc("get_team_link", [postId])).rejects.toThrow("확정");
  });
  it("거절된 지원자는 더 이상 면담 메시지를 전송할 수 없다", async () => {
    await actor(host);
    await rpc("decide_application", [otherApplicationId, "REJECTED"]);
    await actor(other);
    await expect(
      rpc("send_message", [otherApplicationId, "종료 후 메시지"]),
    ).rejects.toThrow("종료");
  });
});
