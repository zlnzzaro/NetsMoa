-- Run once in a fresh Supabase project. All mutations use checked RPCs.
create extension if not exists pgcrypto;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 nickname text not null check (char_length(nickname) between 1 and 20),
 department text not null default '' check (char_length(department)<=50),
 year integer not null default 1 check (year between 1 and 6),
 bio text not null default '' check (char_length(bio)<=100)
);
create table public.posts (
 id uuid primary key default gen_random_uuid(), author_id uuid not null references public.profiles(id),
 title text not null check (char_length(title) between 5 and 80),
 competition text not null check (char_length(competition) between 1 and 100),
 category text not null check (category in ('개발','디자인','아이디어·기획','영상','기타')),
 description text not null check (char_length(description) between 20 and 5000),
 competition_url text not null check (competition_url ~ '^https?://[^[:space:]]+$'),
 hours integer not null check (hours between 1 and 80),
 goal text not null check (goal in ('수상 도전','경험·성장')),
 deadline date not null, closed boolean not null default false,
 color integer not null default 0 check (color between 0 and 5), created_at timestamptz not null default now()
);
-- Separate table: public posts can never accidentally expose the private link.
create table public.post_secrets (
 post_id uuid primary key references public.posts(id) on delete cascade,
 openchat_url text not null check (openchat_url ~ '^https://open[.]kakao[.]com/[^[:space:]]+$')
);
create table public.post_roles (
 id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade,
 name text not null check (char_length(name) between 1 and 30),
 capacity integer not null check (capacity between 1 and 10),
 unique(post_id,name), unique(id,post_id)
);
create table public.applications (
 id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id),
 role_id uuid not null, applicant_id uuid not null references public.profiles(id),
 skills text[] not null check (cardinality(skills) between 1 and 30),
 portfolio text not null default '' check (portfolio='' or portfolio ~ '^https?://[^[:space:]]+$'),
 experience text not null check (char_length(experience) between 10 and 2000),
 motivation text not null check (char_length(motivation) between 5 and 200),
 status text not null default 'PENDING' check(status in ('PENDING','CHATTING','ACCEPTED','REJECTED','CANCELED')),
 created_at timestamptz not null default now(), unique(post_id,applicant_id),
 foreign key (role_id,post_id) references public.post_roles(id,post_id)
);
-- An application is the unique chat room; no redundant chat_rooms table needed.
create table public.messages (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references public.applications(id),
 sender_id uuid references public.profiles(id), body text not null check(char_length(body) between 1 and 2000),
 created_at timestamptz not null default now(), read_at timestamptz
);
create index applications_applicant_idx on public.applications(applicant_id);
create index applications_role_status_idx on public.applications(role_id,status);
create index posts_author_idx on public.posts(author_id);
create index messages_room_idx on public.messages(application_id,created_at);

create function public.is_member() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null and lower(split_part(email,'@',2))='knu.ac.kr');
$$;
create function public.require_member() returns uuid language plpgsql stable security definer set search_path='' as $$
begin
 if not public.is_member() then raise exception '인증된 knu.ac.kr 학교 계정으로 로그인해 주세요.'; end if;
 return auth.uid();
end $$;
create function public.owns_post(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select public.is_member() and exists(select 1 from public.posts where id=p_id and author_id=auth.uid());
$$;
create function public.is_participant(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select public.is_member() and exists(select 1 from public.applications a join public.posts p on p.id=a.post_id where a.id=p_id and (a.applicant_id=auth.uid() or p.author_id=auth.uid()));
$$;
create function public.can_view_link(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select public.is_member() and (public.owns_post(p_id) or exists(select 1 from public.applications where post_id=p_id and applicant_id=auth.uid() and status='ACCEPTED'));
$$;

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_secrets enable row level security;
alter table public.post_roles enable row level security;
alter table public.applications enable row level security;
alter table public.messages enable row level security;
create policy public_profiles on public.profiles for select using(true);
create policy public_posts on public.posts for select using(true);
create policy public_roles on public.post_roles for select using(true);
create policy protected_links on public.post_secrets for select to authenticated using(public.can_view_link(post_id));
create policy own_applications on public.applications for select to authenticated using(public.is_participant(id));
create policy own_messages on public.messages for select to authenticated using(public.is_participant(application_id));
revoke all on public.profiles,public.posts,public.post_secrets,public.post_roles,public.applications,public.messages from anon,authenticated;
grant select on public.profiles,public.posts,public.post_roles to anon,authenticated;
grant select on public.post_secrets,public.applications,public.messages to authenticated;

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if lower(split_part(new.email,'@',2)) is distinct from 'knu.ac.kr' then raise exception 'knu.ac.kr 학교 이메일만 가입할 수 있어요.'; end if;
 insert into public.profiles(id,nickname) values(new.id,left(split_part(new.email,'@',1),20));
 return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
-- Recommended Auth > Hooks > Before User Created hook; rejects before sending mail.
create function public.before_user_created(event jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if lower(split_part(event->'user'->>'email','@',2)) is distinct from 'knu.ac.kr' then
  return '{"error":{"http_code":403,"message":"knu.ac.kr 학교 이메일만 가입할 수 있어요."}}'::jsonb;
 end if;
 return '{}'::jsonb;
end $$;

create function public.load_state() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
  'profiles',coalesce((select jsonb_agg(to_jsonb(u)) from public.profiles u),'[]'::jsonb),
  'posts',coalesce((select jsonb_agg(to_jsonb(p)||jsonb_build_object('roles',coalesce((
   select jsonb_agg(to_jsonb(r)||jsonb_build_object('filled',(select count(*) from public.applications a where a.role_id=r.id and a.status='ACCEPTED'))) from public.post_roles r where r.post_id=p.id
  ),'[]'::jsonb)) order by p.created_at desc) from public.posts p),'[]'::jsonb),
  'applications',coalesce((select jsonb_agg(to_jsonb(a) order by a.created_at) from public.applications a where public.is_participant(a.id)),'[]'::jsonb),
  'messages',coalesce((select jsonb_agg(to_jsonb(m) order by m.created_at,m.id) from public.messages m where public.is_participant(m.application_id)),'[]'::jsonb)
 );
$$;
create function public.save_profile(p_data jsonb) returns void language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.require_member();
begin
 update public.profiles set nickname=trim(p_data->>'nickname'),department=trim(p_data->>'department'),year=(p_data->>'year')::integer,bio=trim(p_data->>'bio') where id=actor;
end $$;

create function public.save_post(p_data jsonb,p_id uuid default null) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.require_member(); target uuid:=coalesce(p_id,gen_random_uuid()); r jsonb; owner uuid;
begin
 if jsonb_typeof(p_data->'roles') is distinct from 'array' or jsonb_array_length(p_data->'roles') not between 1 and 5 then raise exception '모집 역할은 1~5개 입력해 주세요.'; end if;
 if (p_data->>'deadline')::date<(now() at time zone 'Asia/Seoul')::date then raise exception '모집 마감일을 확인해 주세요.'; end if;
 if p_id is not null then
  select author_id into owner from public.posts where id=p_id for update;
  if owner is distinct from actor then raise exception '수정 권한이 없어요.'; end if;
  if exists(select 1 from public.applications where post_id=p_id) then raise exception '지원자가 있는 글은 모집 마감만 가능해요.'; end if;
  update public.posts set title=trim(p_data->>'title'),competition=trim(p_data->>'competition'),category=p_data->>'category',description=trim(p_data->>'description'),competition_url=p_data->>'competition_url',hours=(p_data->>'hours')::integer,goal=p_data->>'goal',deadline=(p_data->>'deadline')::date where id=p_id;
  delete from public.post_roles where post_id=p_id;
 else
  insert into public.posts(id,author_id,title,competition,category,description,competition_url,hours,goal,deadline,color)
   values(target,actor,trim(p_data->>'title'),trim(p_data->>'competition'),p_data->>'category',trim(p_data->>'description'),p_data->>'competition_url',(p_data->>'hours')::integer,p_data->>'goal',(p_data->>'deadline')::date,floor(random()*6)::integer);
 end if;
 insert into public.post_secrets(post_id,openchat_url) values(target,p_data->>'openchat_url') on conflict(post_id) do update set openchat_url=excluded.openchat_url;
 for r in select * from jsonb_array_elements(p_data->'roles') loop
  insert into public.post_roles(post_id,name,capacity) values(target,trim(r->>'name'),(r->>'capacity')::integer);
 end loop;
 return target;
end $$;

create function public.manage_post(p_id uuid,p_action text) returns void language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.require_member(); owner uuid;
begin
 select author_id into owner from public.posts where id=p_id for update;
 if owner is distinct from actor then raise exception '처리 권한이 없어요.'; end if;
 if p_action='close' then update public.posts set closed=true where id=p_id;
 elsif p_action='delete' then
  if exists(select 1 from public.applications where post_id=p_id) then raise exception '지원 내역이 있는 모집글은 삭제할 수 없어요. 모집 마감을 이용해 주세요.'; end if;
  delete from public.posts where id=p_id;
 else raise exception '잘못된 요청이에요.';
 end if;
end $$;

create function public.apply_to_post(p_data jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.require_member(); p public.posts; r public.post_roles; target uuid;
begin
 select * into p from public.posts where id=(p_data->>'post_id')::uuid for update;
 if p.id is null then raise exception '모집글이 없어요.'; end if;
 if p.author_id=actor then raise exception '내가 작성한 모집글에는 지원할 수 없어요.'; end if;
 if p.closed or p.deadline<(now() at time zone 'Asia/Seoul')::date then raise exception '마감된 모집글이에요.'; end if;
 if exists(select 1 from public.applications where post_id=p.id and applicant_id=actor) then raise exception '이미 지원한 모집글이에요.'; end if;
 select * into r from public.post_roles where id=(p_data->>'role_id')::uuid and post_id=p.id;
 if r.id is null then raise exception '이 모집글의 역할을 선택해 주세요.'; end if;
 if (select count(*) from public.applications where role_id=r.id and status='ACCEPTED')>=r.capacity then raise exception '선택한 역할은 모집이 마감되었어요.'; end if;
 insert into public.applications(post_id,role_id,applicant_id,skills,portfolio,experience,motivation)
 values(p.id,r.id,actor,array(select trim(jsonb_array_elements_text(p_data->'skills'))),coalesce(p_data->>'portfolio',''),trim(p_data->>'experience'),trim(p_data->>'motivation')) returning id into target;
 insert into public.messages(application_id,body) values(target,'지원이 완료되었어요. 이 공간에서 서로의 기대와 일정을 나누어 보세요.');
 return target;
end $$;

create function public.decide_application(p_id uuid,p_status text) returns void language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.require_member(); a public.applications; p public.posts; r public.post_roles; body text;
begin
 -- Lock the post first for every capacity-changing operation, then the application.
 select p0.* into p from public.posts p0 where p0.id=(select post_id from public.applications where id=p_id) for update;
 select * into a from public.applications where id=p_id for update;
 if a.id is null then raise exception '지원 내역이 없어요.'; end if;
 if a.status not in ('PENDING','CHATTING') then raise exception '이미 처리가 완료된 지원이에요.'; end if;
 if p_status='CANCELED' then
  if a.applicant_id<>actor then raise exception '취소 권한이 없어요.'; end if;
  body:='지원자가 신청을 취소했어요.';
 elsif p_status in ('ACCEPTED','REJECTED') then
  if p.author_id<>actor then raise exception '선발 권한이 없어요.'; end if;
  if p_status='ACCEPTED' then
   select * into r from public.post_roles where id=a.role_id;
   if p.closed or (select count(*) from public.applications where role_id=r.id and status='ACCEPTED')>=r.capacity then raise exception '해당 역할의 모집이 마감되었어요.'; end if;
   body:='팀 합류가 확정되었어요! 상단의 팀 오픈채팅 버튼에서 입장할 수 있어요.';
  else body:='이번 모집의 선발이 종료되었어요. 다음 도전을 응원합니다.';
  end if;
 else raise exception '잘못된 상태 변경이에요.';
 end if;
 update public.applications set status=p_status where id=p_id;
 if p_status='ACCEPTED' and not exists(select 1 from public.post_roles r0 where r0.post_id=p.id and r0.capacity>(select count(*) from public.applications a0 where a0.role_id=r0.id and a0.status='ACCEPTED')) then update public.posts set closed=true where id=p.id; end if;
 insert into public.messages(application_id,body) values(p_id,body);
end $$;

create function public.send_message(p_id uuid,p_body text) returns void language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.require_member(); a public.applications;
begin
 if not public.is_participant(p_id) then raise exception '참여한 면담만 볼 수 있어요.'; end if;
 select * into a from public.applications where id=p_id for update;
 if a.status in ('REJECTED','CANCELED') then raise exception '종료된 면담이에요.'; end if;
 insert into public.messages(application_id,sender_id,body) values(p_id,actor,trim(p_body));
 if a.status='PENDING' then update public.applications set status='CHATTING' where id=p_id; end if;
end $$;
create function public.mark_read(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.require_member();
begin
 if not public.is_participant(p_id) then raise exception '참여한 면담만 볼 수 있어요.'; end if;
 update public.messages set read_at=now() where application_id=p_id and sender_id is distinct from actor and read_at is null;
end $$;
create function public.get_team_link(p_id uuid) returns text language plpgsql stable security definer set search_path='' as $$
begin
 perform public.require_member();
 if not public.can_view_link(p_id) then raise exception '합류가 확정된 팀원만 확인할 수 있어요.'; end if;
 return (select openchat_url from public.post_secrets where post_id=p_id);
end $$;

-- SECURITY DEFINER functions are never globally callable by default.
revoke all on function public.is_member(),public.require_member(),public.owns_post(uuid),public.is_participant(uuid),public.can_view_link(uuid),public.handle_new_user(),public.before_user_created(jsonb),public.load_state(),public.save_profile(jsonb),public.save_post(jsonb,uuid),public.manage_post(uuid,text),public.apply_to_post(jsonb),public.decide_application(uuid,text),public.send_message(uuid,text),public.mark_read(uuid),public.get_team_link(uuid) from public,anon,authenticated;
grant execute on function public.load_state() to anon,authenticated;
grant execute on function public.is_member(),public.owns_post(uuid),public.is_participant(uuid),public.can_view_link(uuid),public.save_profile(jsonb),public.save_post(jsonb,uuid),public.manage_post(uuid,text),public.apply_to_post(jsonb),public.decide_application(uuid,text),public.send_message(uuid,text),public.mark_read(uuid),public.get_team_link(uuid) to authenticated;
grant usage on schema public to supabase_auth_admin;
grant execute on function public.before_user_created(jsonb) to supabase_auth_admin;

-- RLS filters all Realtime data. Never add post_secrets to the publication.
alter publication supabase_realtime add table public.posts,public.post_roles,public.applications,public.messages;
