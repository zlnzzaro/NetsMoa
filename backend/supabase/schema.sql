-- NETogether Supabase 스키마
-- 새 Supabase 프로젝트의 SQL Editor 에서 이 파일 전체를 한 번 실행해요. (그다음 seed.sql)
-- 구조: 읽기는 RLS 가 걸린 테이블 직접 조회, 쓰기는 모두 권한 검사를 하는 RPC 함수로만.
-- 코드값은 frontend/src/constants/codes.js 와 똑같이 맞춰 두었어요.

create extension if not exists pgcrypto with schema extensions;

-- ───────────────────────── 테이블 ─────────────────────────

-- 회원 프로필 (auth.users 와 1:1). 이메일은 auth.users 에만 있어요.
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nickname    text not null unique check (char_length(nickname) between 2 and 12),
  student_id  text not null default '' check (char_length(student_id) <= 20),
  bio         text not null default '' check (char_length(bio) <= 100),
  skills      text[] not null default '{}' check (cardinality(skills) <= 10),
  roles       text[] not null default '{}' check (roles <@ array['FRONTEND','BACKEND','PM','DESIGN']),
  photo_url   text check (photo_url is null or char_length(photo_url) <= 300000),
  created_at  timestamptz not null default now()
);

create table public.posts (
  id              uuid primary key default gen_random_uuid(),
  author_id       uuid not null references public.profiles(id) on delete cascade,
  author_role_id  uuid, -- 작성자 본인 자리 (첫 번째 역할)
  category        text not null check (category in ('COMPETITION','CAPSTONE','STUDY','SIDE_PROJECT')),
  status          text not null default 'OPEN' check (status in ('OPEN','CLOSED')),
  title           text not null check (char_length(title) between 1 and 100),
  description     text not null default '' check (char_length(description) <= 5000),
  tech_stack      text[] not null default '{}' check (cardinality(tech_stack) <= 20),
  deadline        date,
  created_at      timestamptz not null default now()
);

create table public.post_roles (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  role_code  text not null check (role_code in ('FRONTEND','BACKEND','AI','DESIGN','PRESENTATION','OTHER')),
  capacity   integer not null check (capacity between 1 and 10),
  skills     text[] not null default '{}' check (cardinality(skills) <= 20),
  sort       integer not null default 0,
  unique (post_id, role_code)
);
alter table public.posts
  add constraint posts_author_role_fk foreign key (author_role_id) references public.post_roles(id) on delete set null;

-- 팀 채팅 링크: 공개 테이블(posts)과 분리해서, 팀원에게만 보이게 해요.
create table public.team_spaces (
  post_id   uuid primary key references public.posts(id) on delete cascade,
  chat_url  text not null check (chat_url ~ '^https?://[^[:space:]]+$')
);

-- 지원서 = 1:1 면담 채팅방
create table public.applications (
  id            uuid primary key default gen_random_uuid(),
  post_id       uuid not null references public.posts(id) on delete cascade,
  role_id       uuid not null references public.post_roles(id) on delete cascade,
  applicant_id  uuid not null references public.profiles(id) on delete cascade,
  message       text not null default '' check (char_length(message) <= 200),
  status        text not null default 'PENDING' check (status in ('PENDING','CHATTING','ACCEPTED','REJECTED','CANCELED')),
  created_at    timestamptz not null default now(),
  unique (role_id, applicant_id)
);

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  application_id  uuid not null references public.applications(id) on delete cascade,
  sender_id       uuid references public.profiles(id) on delete set null, -- null 이면 시스템 안내
  body            text not null check (char_length(body) between 1 and 1000),
  created_at      timestamptz not null default now()
);

create index posts_created_idx on public.posts(created_at desc);
create index post_roles_post_idx on public.post_roles(post_id);
create index applications_post_idx on public.applications(post_id);
create index applications_applicant_idx on public.applications(applicant_id);
create index messages_room_idx on public.messages(application_id, created_at);

-- ───────────────────────── 권한 도우미 ─────────────────────────

create function public.is_post_author(p_post uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.posts where id = p_post and author_id = auth.uid());
$$;

-- 작성자이거나 합류 확정된 팀원
create function public.is_team_member(p_post uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_post_author(p_post) or exists(
    select 1 from public.applications
    where post_id = p_post and applicant_id = auth.uid() and status = 'ACCEPTED');
$$;

-- 면담 채팅 참여자 (지원자 또는 그 모집글 작성자)
create function public.is_participant(p_app uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(
    select 1 from public.applications a join public.posts p on p.id = a.post_id
    where a.id = p_app and (a.applicant_id = auth.uid() or p.author_id = auth.uid()));
$$;

-- 역할에 찬 인원 = (작성자 자리면 1) + 합류 확정 인원
create function public.role_filled(p_role uuid) returns integer
language sql stable security definer set search_path = '' as $$
  select (case when exists(select 1 from public.posts p where p.author_role_id = p_role) then 1 else 0 end)
       + (select count(*)::integer from public.applications where role_id = p_role and status = 'ACCEPTED');
$$;

create function public.require_user() returns uuid
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists(select 1 from public.profiles where id = auth.uid()) then
    raise exception '로그인이 필요해요' using errcode = '28000';
  end if;
  return auth.uid();
end $$;

-- ───────────────────────── RLS (읽기 규칙) ─────────────────────────

alter table public.profiles     enable row level security;
alter table public.posts        enable row level security;
alter table public.post_roles   enable row level security;
alter table public.team_spaces  enable row level security;
alter table public.applications enable row level security;
alter table public.messages     enable row level security;

create policy profiles_read on public.profiles for select using (true);
create policy posts_read on public.posts for select using (true);
create policy roles_read on public.post_roles for select using (true);
create policy team_read on public.team_spaces for select to authenticated using (public.is_team_member(post_id));
-- 합류 확정된 지원은 팀원 표시용으로 공개, 나머지는 지원자 본인과 작성자만
create policy applications_read on public.applications for select
  using (status = 'ACCEPTED' or applicant_id = auth.uid() or public.is_post_author(post_id));
create policy messages_read on public.messages for select to authenticated using (public.is_participant(application_id));

-- 테이블 직접 쓰기는 막고, 읽기만 열어요. 학번은 본인만(get_me) 볼 수 있게 칼럼 단위로 열어요.
revoke all on public.profiles, public.posts, public.post_roles, public.team_spaces, public.applications, public.messages
  from anon, authenticated;
grant select (id, nickname, bio, skills, roles, photo_url, created_at) on public.profiles to anon, authenticated;
grant select on public.posts, public.post_roles, public.applications to anon, authenticated;
grant select on public.team_spaces, public.messages to authenticated;

-- ───────────────────────── 가입 시 프로필 자동 생성 ─────────────────────────

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  base text;
  nick text;
  n integer := 0;
begin
  base := left(coalesce(nullif(trim(new.raw_user_meta_data->>'nickname'), ''), split_part(new.email, '@', 1)), 12);
  if char_length(base) < 2 then base := rpad(base, 2, '0'); end if;
  nick := base;
  -- 닉네임이 겹치면 뒤에 숫자를 붙여요 (가입 자체가 실패하지 않게)
  while exists(select 1 from public.profiles where nickname = nick) loop
    n := n + 1;
    nick := left(base, 12 - char_length(n::text)) || n;
  end loop;
  insert into public.profiles(id, nickname, student_id)
  values (new.id, nick, left(coalesce(trim(new.raw_user_meta_data->>'student_id'), ''), 20));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────── RPC: 회원 ─────────────────────────

create function public.nickname_available(p_nickname text) returns boolean
language sql stable security definer set search_path = '' as $$
  select not exists(select 1 from public.profiles where nickname = trim(p_nickname)
                    and id is distinct from auth.uid());
$$;

-- 내 정보 (학번·이메일 포함)
create function public.get_me() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare actor uuid := public.require_user();
begin
  return (select to_jsonb(p) || jsonb_build_object('email', u.email)
          from public.profiles p join auth.users u on u.id = p.id where p.id = actor);
end $$;

-- 보낸 값만 바꿔요: nickname, bio, skills, roles, photo_url
create function public.update_me(p jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := public.require_user();
  nick text;
begin
  if p ? 'nickname' then
    nick := trim(p->>'nickname');
    if char_length(nick) not between 2 and 12 then
      raise exception '닉네임은 2~12자로 적어 주세요' using errcode = '22023';
    end if;
    if exists(select 1 from public.profiles where nickname = nick and id <> actor) then
      raise exception '이미 사용 중인 닉네임이에요' using errcode = '23505';
    end if;
    update public.profiles set nickname = nick where id = actor;
  end if;
  if p ? 'bio' then
    update public.profiles set bio = left(trim(coalesce(p->>'bio', '')), 100) where id = actor;
  end if;
  if p ? 'skills' then
    if (select count(distinct s) from jsonb_array_elements_text(p->'skills') s) > 10 then
      raise exception '기술스택은 10개까지 고를 수 있어요' using errcode = '22023';
    end if;
    -- 중복은 빼고 고른 순서는 지켜요
    update public.profiles
      set skills = array(select s from (select s, min(i) i from jsonb_array_elements_text(p->'skills') with ordinality t(s, i) group by s) x order by i)
      where id = actor;
  end if;
  if p ? 'roles' then
    update public.profiles
      set roles = array(select r from unnest(array['FRONTEND','BACKEND','PM','DESIGN']) with ordinality t(r, i)
                        where r in (select jsonb_array_elements_text(p->'roles')) order by i)
      where id = actor;
  end if;
  if p ? 'photo_url' then
    update public.profiles set photo_url = nullif(p->>'photo_url', '') where id = actor;
  end if;
  return public.get_me();
end $$;

-- ───────────────────────── RPC: 모집글 ─────────────────────────

-- p: { title, category, description, tech_stack[], deadline, chat_url, roles: [{ role_code, capacity, skills[] }] }
-- 첫 번째 역할은 작성자 본인 자리예요.
create function public.create_post(p jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := public.require_user();
  target uuid;
  r jsonb;
  i integer := 0;
  rid uuid;
  first_role uuid;
begin
  if char_length(trim(coalesce(p->>'title', ''))) = 0 then raise exception '제목을 입력해 주세요'; end if;
  if jsonb_typeof(p->'roles') is distinct from 'array' or jsonb_array_length(p->'roles') not between 1 and 6 then
    raise exception '역할은 1~6개 골라 주세요';
  end if;
  insert into public.posts(author_id, category, title, description, tech_stack, deadline)
  values (actor, p->>'category', trim(p->>'title'), trim(coalesce(p->>'description', '')),
          array(select trim(x) from jsonb_array_elements_text(coalesce(p->'tech_stack', '[]')) x where trim(x) <> ''),
          nullif(p->>'deadline', '')::date)
  returning id into target;

  for r in select * from jsonb_array_elements(p->'roles') loop
    begin
      insert into public.post_roles(post_id, role_code, capacity, skills, sort)
      values (target, r->>'role_code', greatest(1, least(10, coalesce((r->>'capacity')::integer, 1))),
              array(select trim(x) from jsonb_array_elements_text(coalesce(r->'skills', '[]')) x where trim(x) <> ''), i)
      returning id into rid;
    exception when unique_violation then
      raise exception '같은 역할이 두 번 들어갔어요. 인원 수로 조절해 주세요';
    end;
    if i = 0 then first_role := rid; end if;
    i := i + 1;
  end loop;
  update public.posts set author_role_id = first_role where id = target;

  if nullif(trim(coalesce(p->>'chat_url', '')), '') is not null then
    insert into public.team_spaces(post_id, chat_url) values (target, trim(p->>'chat_url'));
  end if;
  return target;
end $$;

-- ───────────────────────── RPC: 지원·면담·선발 ─────────────────────────

create function public.apply_to_role(p_post uuid, p_role uuid, p_message text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := public.require_user();
  po public.posts;
  ro public.post_roles;
  aid uuid;
begin
  select * into po from public.posts where id = p_post for update;
  if po.id is null then raise exception '모집글을 찾을 수 없어요'; end if;
  if po.author_id = actor then raise exception '내 모집글에는 지원할 수 없어요'; end if;
  if po.status <> 'OPEN' then raise exception '이미 마감된 모집글이에요'; end if;
  select * into ro from public.post_roles where id = p_role and post_id = po.id;
  if ro.id is null then raise exception '이 모집글의 역할을 골라 주세요'; end if;
  if public.role_filled(ro.id) >= ro.capacity then raise exception '이 역할은 자리가 다 찼어요'; end if;
  if exists(select 1 from public.applications where post_id = po.id and applicant_id = actor and status = 'ACCEPTED') then
    raise exception '이미 이 팀에 합류했어요';
  end if;

  -- 취소했던 지원서가 있으면 새로 덮어써요
  insert into public.applications(post_id, role_id, applicant_id, message)
  values (po.id, ro.id, actor, left(trim(coalesce(p_message, '')), 200))
  on conflict (role_id, applicant_id) do update
    set message = excluded.message, status = 'PENDING', created_at = now()
    where public.applications.status = 'CANCELED'
  returning id into aid;
  if aid is null then raise exception '이미 지원한 역할이에요'; end if;
  return aid;
end $$;

create function public.cancel_application(p_app uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := public.require_user();
  a public.applications;
begin
  select * into a from public.applications where id = p_app for update;
  if a.id is null or a.applicant_id <> actor then raise exception '내 지원만 취소할 수 있어요'; end if;
  if a.status not in ('PENDING', 'CHATTING') then raise exception '이미 결정이 난 지원이에요'; end if;
  update public.applications set status = 'CANCELED' where id = p_app;
  insert into public.messages(application_id, body) values (p_app, '지원자가 신청을 취소했어요.');
end $$;

-- 작성자 쪽 공통 확인: 모집글을 잠그고 작성자인지 확인한 뒤 모집글을 돌려줘요
create function public.lock_for_author(p_app uuid) returns public.posts
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := public.require_user();
  po public.posts;
begin
  select * into po from public.posts where id = (select post_id from public.applications where id = p_app) for update;
  if po.id is null then raise exception '지원 내역을 찾을 수 없어요'; end if;
  if po.author_id <> actor then raise exception '모집글 작성자만 할 수 있어요'; end if;
  return po;
end $$;

create function public.start_chat(p_app uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  a public.applications;
  po public.posts;
begin
  po := public.lock_for_author(p_app);
  select * into a from public.applications where id = p_app for update;
  if a.status not in ('PENDING', 'CHATTING') then raise exception '이미 결정이 난 지원이에요'; end if;
  update public.applications set status = 'CHATTING' where id = p_app;
  if not exists(select 1 from public.messages where application_id = p_app and sender_id is not null) then
    insert into public.messages(application_id, sender_id, body)
    values (p_app, po.author_id, '안녕하세요! 지원 고마워요. 잠깐 이야기 나눠 볼까요?');
  end if;
end $$;

create function public.send_message(p_app uuid, p_body text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := public.require_user();
  st text;
begin
  if not public.is_participant(p_app) then raise exception '면담 당사자만 메시지를 보낼 수 있어요'; end if;
  select status into st from public.applications where id = p_app;
  if st in ('CANCELED', 'REJECTED') then raise exception '끝난 면담이에요'; end if;
  if char_length(trim(coalesce(p_body, ''))) = 0 then raise exception '메시지를 입력해 주세요'; end if;
  insert into public.messages(application_id, sender_id, body) values (p_app, actor, left(trim(p_body), 1000));
end $$;

-- 합류 확정. 역할 정원이 차면 남은 지원자 선발 종료, 모든 역할이 차면 모집 마감.
-- 돌려주는 값: 화면에 띄울 안내 문구
create function public.accept_application(p_app uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare
  a public.applications;
  po public.posts;
  ro public.post_roles;
  notice text := '합류를 확정했어요';
begin
  po := public.lock_for_author(p_app);
  select * into a from public.applications where id = p_app for update;
  if a.status not in ('PENDING', 'CHATTING') then raise exception '이미 결정이 난 지원이에요'; end if;
  select * into ro from public.post_roles where id = a.role_id;
  if public.role_filled(ro.id) >= ro.capacity then raise exception '이 역할은 자리가 다 찼어요'; end if;

  update public.applications set status = 'ACCEPTED' where id = p_app;
  insert into public.messages(application_id, body)
  values (p_app, '팀 합류가 확정되었어요! 팀 화면에서 팀 채팅 링크를 확인해 주세요.');
  -- 같은 모집글의 다른 역할에 낸 내 지원은 정리해요
  update public.applications set status = 'CANCELED'
    where post_id = po.id and applicant_id = a.applicant_id and id <> p_app and status in ('PENDING', 'CHATTING');

  if public.role_filled(ro.id) >= ro.capacity then
    update public.applications set status = 'REJECTED' where role_id = ro.id and status in ('PENDING', 'CHATTING');
    notice := '자리가 다 찼어요. 남은 지원자는 선발 종료로 바뀌었어요';
  end if;
  if not exists(select 1 from public.post_roles r where r.post_id = po.id and public.role_filled(r.id) < r.capacity) then
    update public.posts set status = 'CLOSED' where id = po.id;
    update public.applications set status = 'REJECTED' where post_id = po.id and status in ('PENDING', 'CHATTING');
    notice := '정원이 다 차서 모집이 자동으로 마감됐어요';
  end if;
  return notice;
end $$;

create function public.reject_application(p_app uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  a public.applications;
  po public.posts;
begin
  po := public.lock_for_author(p_app);
  select * into a from public.applications where id = p_app for update;
  if a.status not in ('PENDING', 'CHATTING') then raise exception '이미 결정이 난 지원이에요'; end if;
  update public.applications set status = 'REJECTED' where id = p_app;
  insert into public.messages(application_id, body) values (p_app, '이번 모집의 선발이 종료되었어요. 다음 도전을 응원해요.');
end $$;

-- 확정·종료를 되돌려 다시 검토 대기로. 마감됐던 모집도 다시 열어요.
create function public.undo_application(p_app uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  a public.applications;
  po public.posts;
begin
  po := public.lock_for_author(p_app);
  select * into a from public.applications where id = p_app for update;
  if a.status not in ('ACCEPTED', 'REJECTED') then raise exception '되돌릴 수 없는 상태예요'; end if;
  update public.applications set status = 'PENDING' where id = p_app;
  update public.posts set status = 'OPEN' where id = po.id;
end $$;

-- ───────────────────────── 함수 실행 권한 ─────────────────────────

revoke all on all functions in schema public from public, anon, authenticated;
grant execute on function public.nickname_available(text) to anon, authenticated;
-- RLS 정책 안에서 쓰는 도우미
grant execute on function public.is_post_author(uuid), public.is_participant(uuid), public.is_team_member(uuid)
  to anon, authenticated;
grant execute on function
  public.get_me(), public.update_me(jsonb), public.create_post(jsonb),
  public.apply_to_role(uuid, uuid, text), public.cancel_application(uuid),
  public.start_chat(uuid), public.send_message(uuid, text),
  public.accept_application(uuid), public.reject_application(uuid), public.undo_application(uuid)
  to authenticated;

-- 실시간 채팅: 메시지와 지원 상태 변경을 구독해요 (RLS 가 그대로 적용돼요)
-- 새 모집글 알림: posts INSERT 를 구독해서 내 기술스택과 맞으면 알림을 띄워요
alter publication supabase_realtime add table public.messages, public.applications, public.posts;
