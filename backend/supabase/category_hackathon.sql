-- 모집글 분류에 '해커톤'(HACKATHON) 추가
-- schema.sql 에도 반영돼 있어요. 이미 schema.sql 을 실행해 둔 DB 에 이 변경만 적용할 때 이 파일을 실행해요.
-- 여러 번 실행해도 괜찮아요.
alter table public.posts drop constraint if exists posts_category_check;
alter table public.posts add constraint posts_category_check
  check (category in ('COMPETITION','HACKATHON','CAPSTONE','STUDY','SIDE_PROJECT'));
