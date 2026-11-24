-- 모집 마감·삭제 RPC (작성자 전용)
-- schema.sql 에도 들어 있어요. 이미 schema.sql 을 실행해 둔 DB 에 이 기능만 추가할 때 이 파일을 실행해요.
-- 여러 번 실행해도 괜찮아요 (create or replace).

-- 작성자가 직접 모집 마감. 아직 결정 안 된 지원(검토 대기·면담 중)은 선발 종료로 바꿔요.
create or replace function public.close_post(p_post uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := public.require_user();
  po public.posts;
  aid uuid;
begin
  select * into po from public.posts where id = p_post for update;
  if po.id is null then raise exception '모집글을 찾을 수 없어요'; end if;
  if po.author_id <> actor then raise exception '모집글 작성자만 할 수 있어요'; end if;
  if po.status = 'CLOSED' then raise exception '이미 마감된 모집글이에요'; end if;
  update public.posts set status = 'CLOSED' where id = po.id;
  for aid in
    update public.applications set status = 'REJECTED'
    where post_id = po.id and status in ('PENDING', 'CHATTING') returning id
  loop
    insert into public.messages(application_id, body) values (aid, '모집이 마감되어 선발이 종료되었어요. 다음 도전을 응원해요.');
  end loop;
end $$;

-- 모집글 삭제. 작성자만, 그리고 지원자가 한 명도 없을 때만 (취소한 지원은 빼고 세요).
-- 지원자가 있으면 삭제 대신 close_post 로 마감해요. 역할·팀 링크·취소된 지원은 함께 지워져요.
create or replace function public.delete_post(p_post uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := public.require_user();
  po public.posts;
begin
  select * into po from public.posts where id = p_post for update;
  if po.id is null then raise exception '모집글을 찾을 수 없어요'; end if;
  if po.author_id <> actor then raise exception '모집글 작성자만 삭제할 수 있어요'; end if;
  if exists(select 1 from public.applications where post_id = po.id and status <> 'CANCELED') then
    raise exception '지원자가 있는 모집글은 삭제할 수 없어요. 대신 모집을 마감해 주세요' using errcode = '23514';
  end if;
  delete from public.posts where id = po.id;
end $$;

revoke all on function public.close_post(uuid), public.delete_post(uuid) from public, anon;
grant execute on function public.close_post(uuid), public.delete_post(uuid) to authenticated;
