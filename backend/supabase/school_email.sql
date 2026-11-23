-- 학교 이메일(@knu.ac.kr)로만 가입하게 막는 규칙
-- 실행 순서: schema.sql → school_email.sql(이 파일) → seed.sql
-- 도메인을 바꾸려면 아래 'knu.ac.kr' 과 frontend 의 VITE_SCHOOL_DOMAIN 을 함께 바꿔요.
--
-- 막는 대상: 회원가입·이메일 변경 (Supabase Auth 가 supabase_auth_admin 권한으로 auth.users 에 쓰는 경우)
-- 통과: SQL Editor 에서 직접 넣는 계정 (seed.sql 의 시연 계정 @netsmoa.dev 처럼)

-- security definer 를 쓰지 않아요: 그래야 current_user 가 실제로 쓰는 쪽(supabase_auth_admin / postgres)이 돼요
create or replace function public.require_school_email() returns trigger
language plpgsql set search_path = '' as $$
begin
  if current_user = 'supabase_auth_admin'
     and lower(split_part(coalesce(new.email, ''), '@', 2)) is distinct from 'knu.ac.kr' then
    raise exception '학교 이메일(@knu.ac.kr)로만 가입할 수 있어요' using errcode = '22023';
  end if;
  return new;
end $$;

revoke all on function public.require_school_email() from public, anon, authenticated;
grant execute on function public.require_school_email() to supabase_auth_admin;

drop trigger if exists require_school_email on auth.users;
create trigger require_school_email
  before insert or update of email on auth.users
  for each row execute function public.require_school_email();
