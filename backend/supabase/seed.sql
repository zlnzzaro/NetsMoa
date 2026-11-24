-- NETogether 시연용 데이터 (schema.sql 다음에 한 번 실행)
-- 모든 데모 계정 비밀번호: netsmoa1234
-- 예) yujin@netsmoa.dev (유진), seojun@netsmoa.dev (박서준, '캠퍼스 중고거래' 모집글 작성자)
-- 날짜는 실행한 날 기준으로 맞춰져요. 다시 넣고 싶으면 맨 아래 '초기화' 주석을 참고하세요.
begin;

-- 데모 계정 (auth.users + 이메일 로그인 identity). 프로필은 트리거가 만들어요.
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-yujin')::uuid, 'authenticated', 'authenticated', 'yujin@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"유진"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-yujin')::uuid, md5('u-yujin')::uuid::text,
  jsonb_build_object('sub', md5('u-yujin')::uuid::text, 'email', 'yujin@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '유진', bio = '컴퓨터학부 2학년 · 프론트엔드', skills = array['React','JavaScript','Figma']::text[],
  roles = array['FRONTEND']::text[], student_id = '2025012345' where id = md5('u-yujin')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-seojun')::uuid, 'authenticated', 'authenticated', 'seojun@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"박서준"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-seojun')::uuid, md5('u-seojun')::uuid::text,
  jsonb_build_object('sub', md5('u-seojun')::uuid::text, 'email', 'seojun@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '박서준', bio = '', skills = array['React','TypeScript']::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-seojun')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-doyun')::uuid, 'authenticated', 'authenticated', 'doyun@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"이도윤"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-doyun')::uuid, md5('u-doyun')::uuid::text,
  jsonb_build_object('sub', md5('u-doyun')::uuid::text, 'email', 'doyun@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '이도윤', bio = '', skills = array['Java','Spring Boot']::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-doyun')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-harin')::uuid, 'authenticated', 'authenticated', 'harin@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"최하린"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-harin')::uuid, md5('u-harin')::uuid::text,
  jsonb_build_object('sub', md5('u-harin')::uuid::text, 'email', 'harin@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '최하린', bio = '', skills = array['React','CSS']::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-harin')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-minjae')::uuid, 'authenticated', 'authenticated', 'minjae@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"정민재"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-minjae')::uuid, md5('u-minjae')::uuid::text,
  jsonb_build_object('sub', md5('u-minjae')::uuid::text, 'email', 'minjae@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '정민재', bio = '', skills = array['Java','Spring Boot']::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-minjae')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-jiwoo')::uuid, 'authenticated', 'authenticated', 'jiwoo@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"한지우"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-jiwoo')::uuid, md5('u-jiwoo')::uuid::text,
  jsonb_build_object('sub', md5('u-jiwoo')::uuid::text, 'email', 'jiwoo@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '한지우', bio = '', skills = array['MySQL']::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-jiwoo')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-taeo')::uuid, 'authenticated', 'authenticated', 'taeo@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"김태오"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-taeo')::uuid, md5('u-taeo')::uuid::text,
  jsonb_build_object('sub', md5('u-taeo')::uuid::text, 'email', 'taeo@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '김태오', bio = '', skills = array['C++']::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-taeo')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-seoa')::uuid, 'authenticated', 'authenticated', 'seoa@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"윤서아"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-seoa')::uuid, md5('u-seoa')::uuid::text,
  jsonb_build_object('sub', md5('u-seoa')::uuid::text, 'email', 'seoa@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '윤서아', bio = '', skills = array['Python']::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-seoa')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-jimin')::uuid, 'authenticated', 'authenticated', 'jimin@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"오지민"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-jimin')::uuid, md5('u-jimin')::uuid::text,
  jsonb_build_object('sub', md5('u-jimin')::uuid::text, 'email', 'jimin@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '오지민', bio = '', skills = array['Node.js']::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-jimin')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-yuna')::uuid, 'authenticated', 'authenticated', 'yuna@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"서유나"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-yuna')::uuid, md5('u-yuna')::uuid::text,
  jsonb_build_object('sub', md5('u-yuna')::uuid::text, 'email', 'yuna@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '서유나', bio = '', skills = array['Python']::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-yuna')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-hyunwoo')::uuid, 'authenticated', 'authenticated', 'hyunwoo@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"강현우"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-hyunwoo')::uuid, md5('u-hyunwoo')::uuid::text,
  jsonb_build_object('sub', md5('u-hyunwoo')::uuid::text, 'email', 'hyunwoo@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '강현우', bio = '', skills = array['React']::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-hyunwoo')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-hajun')::uuid, 'authenticated', 'authenticated', 'hajun@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"임하준"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-hajun')::uuid, md5('u-hajun')::uuid::text,
  jsonb_build_object('sub', md5('u-hajun')::uuid::text, 'email', 'hajun@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '임하준', bio = '', skills = array[]::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-hajun')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-chaewon')::uuid, 'authenticated', 'authenticated', 'chaewon@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"문채원"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-chaewon')::uuid, md5('u-chaewon')::uuid::text,
  jsonb_build_object('sub', md5('u-chaewon')::uuid::text, 'email', 'chaewon@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '문채원', bio = '', skills = array[]::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-chaewon')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-junseo')::uuid, 'authenticated', 'authenticated', 'junseo@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"배준서"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-junseo')::uuid, md5('u-junseo')::uuid::text,
  jsonb_build_object('sub', md5('u-junseo')::uuid::text, 'email', 'junseo@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '배준서', bio = '', skills = array[]::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-junseo')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-eunbi')::uuid, 'authenticated', 'authenticated', 'eunbi@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"노은비"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-eunbi')::uuid, md5('u-eunbi')::uuid::text,
  jsonb_build_object('sub', md5('u-eunbi')::uuid::text, 'email', 'eunbi@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '노은비', bio = '', skills = array['Next.js']::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-eunbi')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-daeun')::uuid, 'authenticated', 'authenticated', 'daeun@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"정다은"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-daeun')::uuid, md5('u-daeun')::uuid::text,
  jsonb_build_object('sub', md5('u-daeun')::uuid::text, 'email', 'daeun@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '정다은', bio = '', skills = array['CSS']::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-daeun')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-minho')::uuid, 'authenticated', 'authenticated', 'minho@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"황민호"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-minho')::uuid, md5('u-minho')::uuid::text,
  jsonb_build_object('sub', md5('u-minho')::uuid::text, 'email', 'minho@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '황민호', bio = '', skills = array['SQL']::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-minho')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-yerin')::uuid, 'authenticated', 'authenticated', 'yerin@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"조예린"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-yerin')::uuid, md5('u-yerin')::uuid::text,
  jsonb_build_object('sub', md5('u-yerin')::uuid::text, 'email', 'yerin@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '조예린', bio = '', skills = array['SQL']::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-yerin')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-taemin')::uuid, 'authenticated', 'authenticated', 'taemin@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"권태민"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-taemin')::uuid, md5('u-taemin')::uuid::text,
  jsonb_build_object('sub', md5('u-taemin')::uuid::text, 'email', 'taemin@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '권태민', bio = '', skills = array['Unity']::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-taemin')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-jiho')::uuid, 'authenticated', 'authenticated', 'jiho@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"신지호"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-jiho')::uuid, md5('u-jiho')::uuid::text,
  jsonb_build_object('sub', md5('u-jiho')::uuid::text, 'email', 'jiho@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '신지호', bio = '', skills = array['Python']::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-jiho')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-haneul')::uuid, 'authenticated', 'authenticated', 'haneul@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"유하늘"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-haneul')::uuid, md5('u-haneul')::uuid::text,
  jsonb_build_object('sub', md5('u-haneul')::uuid::text, 'email', 'haneul@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '유하늘', bio = '', skills = array['React']::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-haneul')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-soyul')::uuid, 'authenticated', 'authenticated', 'soyul@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"장소율"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-soyul')::uuid, md5('u-soyul')::uuid::text,
  jsonb_build_object('sub', md5('u-soyul')::uuid::text, 'email', 'soyul@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '장소율', bio = '', skills = array['JavaScript']::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-soyul')::uuid;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
values ('00000000-0000-0000-0000-000000000000', md5('u-hyun')::uuid, 'authenticated', 'authenticated', 'hyun@netsmoa.dev',
  extensions.crypt('netsmoa1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"남궁현"}', now(), now(),
  '', '', '', '', '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), md5('u-hyun')::uuid, md5('u-hyun')::uuid::text,
  jsonb_build_object('sub', md5('u-hyun')::uuid::text, 'email', 'hyun@netsmoa.dev', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set nickname = '남궁현', bio = '', skills = array['Python']::text[],
  roles = array[]::text[], student_id = '' where id = md5('u-hyun')::uuid;


-- 모집글 (작성자 자리는 역할을 넣은 뒤에 연결해요)
insert into public.posts (id, author_id, category, status, title, description, tech_stack, deadline, created_at)
values (md5('p-1')::uuid, md5('u-seojun')::uuid, 'COMPETITION', 'OPEN', '해커톤 출품용 캠퍼스 중고거래 웹 같이 만들 분', '2026 컴퓨터학부 해커톤에 낼 캠퍼스 중고거래 웹을 만들어요. 학교 이메일 인증, 거래 채팅, 후기까지 2주 안에 끝내는 게 목표예요.

주 2회 저녁에 온라인으로 모이고, 마지막 주는 오프라인으로 만나요. 처음 해 보는 분도 괜찮아요.', array['React','Spring Boot','PostgreSQL','Figma']::text[], current_date + 6, now() - interval '4920 minutes');
insert into public.posts (id, author_id, category, status, title, description, tech_stack, deadline, created_at)
values (md5('p-2')::uuid, md5('u-taeo')::uuid, 'STUDY', 'OPEN', '백준 골드 목표 알고리즘 스터디', '매주 화·목 밤 9시, 디스코드에서 문제 풀이를 공유해요.', array['C++','Python']::text[], current_date + 1, now() - interval '5100 minutes');
insert into public.posts (id, author_id, category, status, title, description, tech_stack, deadline, created_at)
values (md5('p-3')::uuid, md5('u-jimin')::uuid, 'SIDE_PROJECT', 'OPEN', '공강 시간 맞춰 주는 시간표 공유 앱', '친구들과 시간표를 겹쳐서 같이 비는 시간을 찾아 주는 앱이에요.', array['React','Node.js','MongoDB']::text[], current_date + 11, now() - interval '6120 minutes');
insert into public.posts (id, author_id, category, status, title, description, tech_stack, deadline, created_at)
values (md5('p-4')::uuid, md5('u-yuna')::uuid, 'COMPETITION', 'OPEN', '학과 공지 알려 주는 AI 챗봇 공모전', '학과 공지사항을 물어보면 답해 주는 챗봇을 만들어요.', array['Python','FastAPI','React']::text[], current_date + 4, now() - interval '6600 minutes');
insert into public.posts (id, author_id, category, status, title, description, tech_stack, deadline, created_at)
values (md5('p-5')::uuid, md5('u-hajun')::uuid, 'STUDY', 'CLOSED', 'CS 전공 면접 스터디', '운영체제, 네트워크, DB 질문으로 모의 면접을 해요.', array['CS 기초']::text[], current_date + -2, now() - interval '8040 minutes');
insert into public.posts (id, author_id, category, status, title, description, tech_stack, deadline, created_at)
values (md5('p-6')::uuid, md5('u-eunbi')::uuid, 'SIDE_PROJECT', 'OPEN', '동아리 홈페이지 리뉴얼', '오래된 동아리 홈페이지를 새로 만들어요. 디자인부터 같이 해요.', array['Figma','Next.js']::text[], current_date + 16, now() - interval '9480 minutes');
insert into public.posts (id, author_id, category, status, title, description, tech_stack, deadline, created_at)
values (md5('p-7')::uuid, md5('u-daeun')::uuid, 'SIDE_PROJECT', 'OPEN', '학교 사이트 웹 접근성 개선', '학교 사이트 접근성을 점검하고 개선안을 만들어요.', array['HTML','CSS','React']::text[], current_date + 7, now() - interval '9540 minutes');
insert into public.posts (id, author_id, category, status, title, description, tech_stack, deadline, created_at)
values (md5('p-8')::uuid, md5('u-minho')::uuid, 'STUDY', 'OPEN', '정보처리기사 실기 스터디', '기출을 풀고 서로 채점해요.', array['SQL','Java']::text[], current_date + 0, now() - interval '10980 minutes');
insert into public.posts (id, author_id, category, status, title, description, tech_stack, deadline, created_at)
values (md5('p-9')::uuid, md5('u-taemin')::uuid, 'COMPETITION', 'OPEN', '48시간 게임잼 같이 나갈 팀', '유니티로 2D 퍼즐 게임을 만들어요.', array['Unity','C#','Figma']::text[], current_date + 3, now() - interval '12420 minutes');
insert into public.posts (id, author_id, category, status, title, description, tech_stack, deadline, created_at)
values (md5('p-10')::uuid, md5('u-jiho')::uuid, 'SIDE_PROJECT', 'OPEN', '학식 메뉴 알림 봇', '매일 아침 학식 메뉴를 보내 주는 봇이에요.', array['Python','AWS']::text[], current_date + 9, now() - interval '13860 minutes');
insert into public.posts (id, author_id, category, status, title, description, tech_stack, deadline, created_at)
values (md5('p-11')::uuid, md5('u-haneul')::uuid, 'STUDY', 'OPEN', '리액트 입문 스터디, 처음이어도 괜찮아요', '공식 문서를 같이 읽고 작은 앱을 하나씩 만들어요.', array['React','JavaScript']::text[], current_date + 2, now() - interval '15300 minutes');
insert into public.posts (id, author_id, category, status, title, description, tech_stack, deadline, created_at)
values (md5('p-12')::uuid, md5('u-hyun')::uuid, 'CAPSTONE', 'OPEN', '졸업작품 IoT 스마트 화분', '라즈베리파이로 화분 상태를 앱에서 보여 줘요.', array['Raspberry Pi','Flutter']::text[], current_date + 21, now() - interval '16740 minutes');

insert into public.post_roles (id, post_id, role_code, capacity, skills, sort) values (md5('r-1-fe')::uuid, md5('p-1')::uuid, 'FRONTEND', 2, array['React','TypeScript']::text[], 0);
insert into public.post_roles (id, post_id, role_code, capacity, skills, sort) values (md5('r-1-be')::uuid, md5('p-1')::uuid, 'BACKEND', 2, array['Java','Spring Boot']::text[], 1);
insert into public.post_roles (id, post_id, role_code, capacity, skills, sort) values (md5('r-1-design')::uuid, md5('p-1')::uuid, 'DESIGN', 1, array['Figma']::text[], 2);
insert into public.post_roles (id, post_id, role_code, capacity, skills, sort) values (md5('r-2-other')::uuid, md5('p-2')::uuid, 'OTHER', 4, array['C++','Python']::text[], 3);
insert into public.post_roles (id, post_id, role_code, capacity, skills, sort) values (md5('r-3-fe')::uuid, md5('p-3')::uuid, 'FRONTEND', 1, array['React','JavaScript']::text[], 4);
insert into public.post_roles (id, post_id, role_code, capacity, skills, sort) values (md5('r-3-be')::uuid, md5('p-3')::uuid, 'BACKEND', 1, array['Node.js']::text[], 5);
insert into public.post_roles (id, post_id, role_code, capacity, skills, sort) values (md5('r-4-ai')::uuid, md5('p-4')::uuid, 'AI', 2, array['Python']::text[], 6);
insert into public.post_roles (id, post_id, role_code, capacity, skills, sort) values (md5('r-4-fe')::uuid, md5('p-4')::uuid, 'FRONTEND', 1, array['React']::text[], 7);
insert into public.post_roles (id, post_id, role_code, capacity, skills, sort) values (md5('r-5-other')::uuid, md5('p-5')::uuid, 'OTHER', 3, array[]::text[], 8);
insert into public.post_roles (id, post_id, role_code, capacity, skills, sort) values (md5('r-6-design')::uuid, md5('p-6')::uuid, 'DESIGN', 1, array['Figma']::text[], 9);
insert into public.post_roles (id, post_id, role_code, capacity, skills, sort) values (md5('r-6-fe')::uuid, md5('p-6')::uuid, 'FRONTEND', 2, array['Next.js','React']::text[], 10);
insert into public.post_roles (id, post_id, role_code, capacity, skills, sort) values (md5('r-7-fe')::uuid, md5('p-7')::uuid, 'FRONTEND', 2, array['React','CSS']::text[], 11);
insert into public.post_roles (id, post_id, role_code, capacity, skills, sort) values (md5('r-8-other')::uuid, md5('p-8')::uuid, 'OTHER', 4, array['SQL']::text[], 12);
insert into public.post_roles (id, post_id, role_code, capacity, skills, sort) values (md5('r-9-other')::uuid, md5('p-9')::uuid, 'OTHER', 2, array['Unity','C#']::text[], 13);
insert into public.post_roles (id, post_id, role_code, capacity, skills, sort) values (md5('r-9-design')::uuid, md5('p-9')::uuid, 'DESIGN', 1, array['Figma']::text[], 14);
insert into public.post_roles (id, post_id, role_code, capacity, skills, sort) values (md5('r-10-be')::uuid, md5('p-10')::uuid, 'BACKEND', 1, array['Python']::text[], 15);
insert into public.post_roles (id, post_id, role_code, capacity, skills, sort) values (md5('r-10-fe')::uuid, md5('p-10')::uuid, 'FRONTEND', 1, array['React','JavaScript']::text[], 16);
insert into public.post_roles (id, post_id, role_code, capacity, skills, sort) values (md5('r-11-other')::uuid, md5('p-11')::uuid, 'OTHER', 5, array['React','JavaScript']::text[], 17);
insert into public.post_roles (id, post_id, role_code, capacity, skills, sort) values (md5('r-12-fe')::uuid, md5('p-12')::uuid, 'FRONTEND', 1, array['Flutter']::text[], 18);
insert into public.post_roles (id, post_id, role_code, capacity, skills, sort) values (md5('r-12-other')::uuid, md5('p-12')::uuid, 'OTHER', 1, array['Python']::text[], 19);

update public.posts set author_role_id = md5('r-1-fe')::uuid where id = md5('p-1')::uuid;
update public.posts set author_role_id = md5('r-2-other')::uuid where id = md5('p-2')::uuid;
update public.posts set author_role_id = md5('r-3-be')::uuid where id = md5('p-3')::uuid;
update public.posts set author_role_id = md5('r-4-ai')::uuid where id = md5('p-4')::uuid;
update public.posts set author_role_id = md5('r-5-other')::uuid where id = md5('p-5')::uuid;
update public.posts set author_role_id = md5('r-6-fe')::uuid where id = md5('p-6')::uuid;
update public.posts set author_role_id = md5('r-7-fe')::uuid where id = md5('p-7')::uuid;
update public.posts set author_role_id = md5('r-8-other')::uuid where id = md5('p-8')::uuid;
update public.posts set author_role_id = md5('r-9-other')::uuid where id = md5('p-9')::uuid;
update public.posts set author_role_id = md5('r-10-be')::uuid where id = md5('p-10')::uuid;
update public.posts set author_role_id = md5('r-11-other')::uuid where id = md5('p-11')::uuid;
update public.posts set author_role_id = md5('r-12-other')::uuid where id = md5('p-12')::uuid;

insert into public.team_spaces (post_id, chat_url) values (md5('p-1')::uuid, 'https://discord.gg/campus-market');
insert into public.team_spaces (post_id, chat_url) values (md5('p-2')::uuid, 'https://open.kakao.com/o/algo-study');
insert into public.team_spaces (post_id, chat_url) values (md5('p-3')::uuid, 'https://discord.gg/timetable');
insert into public.team_spaces (post_id, chat_url) values (md5('p-4')::uuid, 'https://discord.gg/notice-bot');
insert into public.team_spaces (post_id, chat_url) values (md5('p-5')::uuid, 'https://open.kakao.com/o/cs-interview');
insert into public.team_spaces (post_id, chat_url) values (md5('p-6')::uuid, 'https://discord.gg/club-web');
insert into public.team_spaces (post_id, chat_url) values (md5('p-7')::uuid, 'https://discord.gg/a11y');
insert into public.team_spaces (post_id, chat_url) values (md5('p-8')::uuid, 'https://open.kakao.com/o/jeongcheo');
insert into public.team_spaces (post_id, chat_url) values (md5('p-9')::uuid, 'https://discord.gg/gamejam');
insert into public.team_spaces (post_id, chat_url) values (md5('p-10')::uuid, 'https://discord.gg/menu-bot');
insert into public.team_spaces (post_id, chat_url) values (md5('p-11')::uuid, 'https://open.kakao.com/o/react-101');
insert into public.team_spaces (post_id, chat_url) values (md5('p-12')::uuid, 'https://discord.gg/smart-pot');

insert into public.applications (id, post_id, role_id, applicant_id, message, status, created_at) values (md5('a-1')::uuid, md5('p-1')::uuid, md5('r-1-fe')::uuid, md5('u-harin')::uuid, 'React로 개인 블로그를 만들어 봤어요.', 'PENDING', now() - interval '4860 minutes');
insert into public.applications (id, post_id, role_id, applicant_id, message, status, created_at) values (md5('a-2')::uuid, md5('p-1')::uuid, md5('r-1-be')::uuid, md5('u-doyun')::uuid, 'Spring Boot 해 봤어요.', 'ACCEPTED', now() - interval '4910 minutes');
insert into public.applications (id, post_id, role_id, applicant_id, message, status, created_at) values (md5('a-3')::uuid, md5('p-1')::uuid, md5('r-1-be')::uuid, md5('u-minjae')::uuid, 'Spring Boot로 REST API 과제를 해 봤어요.', 'CHATTING', now() - interval '4890 minutes');
insert into public.applications (id, post_id, role_id, applicant_id, message, status, created_at) values (md5('a-4')::uuid, md5('p-1')::uuid, md5('r-1-be')::uuid, md5('u-jiwoo')::uuid, 'DB 설계를 좋아해요.', 'CANCELED', now() - interval '4880 minutes');
insert into public.applications (id, post_id, role_id, applicant_id, message, status, created_at) values (md5('a-5')::uuid, md5('p-2')::uuid, md5('r-2-other')::uuid, md5('u-seoa')::uuid, '골드 찍고 싶어요.', 'ACCEPTED', now() - interval '5040 minutes');
insert into public.applications (id, post_id, role_id, applicant_id, message, status, created_at) values (md5('a-6')::uuid, md5('p-4')::uuid, md5('r-4-fe')::uuid, md5('u-hyunwoo')::uuid, '프론트 맡을게요.', 'ACCEPTED', now() - interval '6540 minutes');
insert into public.applications (id, post_id, role_id, applicant_id, message, status, created_at) values (md5('a-7')::uuid, md5('p-5')::uuid, md5('r-5-other')::uuid, md5('u-chaewon')::uuid, '면접 준비 중이에요.', 'ACCEPTED', now() - interval '7980 minutes');
insert into public.applications (id, post_id, role_id, applicant_id, message, status, created_at) values (md5('a-8')::uuid, md5('p-5')::uuid, md5('r-5-other')::uuid, md5('u-junseo')::uuid, '같이 해요.', 'ACCEPTED', now() - interval '7920 minutes');
insert into public.applications (id, post_id, role_id, applicant_id, message, status, created_at) values (md5('a-9')::uuid, md5('p-8')::uuid, md5('r-8-other')::uuid, md5('u-yerin')::uuid, '실기 준비해요.', 'ACCEPTED', now() - interval '10920 minutes');
insert into public.applications (id, post_id, role_id, applicant_id, message, status, created_at) values (md5('a-10')::uuid, md5('p-11')::uuid, md5('r-11-other')::uuid, md5('u-soyul')::uuid, '처음이에요!', 'ACCEPTED', now() - interval '15240 minutes');

insert into public.messages (id, application_id, sender_id, body, created_at) values (md5('m-1')::uuid, md5('a-3')::uuid, md5('u-seojun')::uuid, '안녕하세요! 지원 고마워요. JPA 써 보셨어요?', now() - interval '4885 minutes');
insert into public.messages (id, application_id, sender_id, body, created_at) values (md5('m-2')::uuid, md5('a-3')::uuid, md5('u-minjae')::uuid, '네, 과제에서 조금 써 봤어요. JdbcClient는 처음이에요.', now() - interval '4883 minutes');

commit;

-- 초기화(데모 데이터 전부 지우기):
-- delete from auth.users where email like '%@netsmoa.dev';
