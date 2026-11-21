# 모아 — 경북대학교 공모전 팀 빌딩

교내 공모전 팀원 모집 기획서를 바탕으로 구현한 반응형 웹서비스입니다. 학교 이메일 도메인은 `knu.ac.kr`입니다.

## 실행

```sh
npm install
npm run dev
```

`npm run build`는 TypeScript 검사와 프로덕션 빌드를 실행합니다. 결과물은 `dist/`입니다. `npm test`는 핵심 지원·선발 규칙을 검증합니다.

## 현재 실행 모드

Supabase 환경 변수가 없으면 **체험 모드**로 실행됩니다. 예시 모집글 6개와 지원자 김모아, 모집자 이지원 계정을 제공합니다. 데이터는 현재 브라우저의 localStorage에 저장됩니다. 실제 학생이나 실제 공모전 데이터가 아닙니다.

1. 첫 모집글에서 역할을 선택해 지원합니다.
2. 면담에서 메시지를 보냅니다.
3. 우측 상단 프로필을 열어 **모집자 이지원으로 전환**합니다.
4. 내 모집 관리에서 지원서를 읽고 면담하거나 수락합니다.
5. 프로필에서 지원자 관점으로 돌아가 합류 결과를 확인합니다.

예시 모집글에는 실제 오픈채팅 링크가 없습니다. 직접 작성한 모집글에는 입력한 링크가 수락 후 표시됩니다. 체험 모드는 브라우저 내부 시뮬레이션이므로 보안 경계로 사용해서는 안 됩니다. 실제 이메일 발송·서로 다른 사용자 간 실시간 채팅·서버 접근 제어는 아래 Supabase 연결이 필요합니다.

## 실제 서비스 연결

1. 새 Supabase 프로젝트의 SQL Editor에서 `supabase/migrations/001_initial.sql`을 실행합니다.
2. Authentication에서 이메일 로그인과 이메일 확인을 활성화합니다. `Site URL`과 허용 `Redirect URLs`에 실제 서비스 주소를 등록합니다. 로컬 개발에는 `http://127.0.0.1:5173`을 허용합니다.
3. Authentication → Hooks → Before User Created에서 `public.before_user_created`를 선택합니다. DB 트리거도 `knu.ac.kr` 도메인을 검사하며, 모든 보호된 API는 이메일 확인 여부를 서버에서 다시 검사합니다.
4. 운영용 이메일 발송을 위해 SMTP를 설정합니다. 기본 Supabase 이메일 발송은 제한이 있으므로 학교 사용자에게 배포하기 전에 실제 수신을 확인합니다.
5. `.env.example`을 `.env.local`로 복사하고 다음 값을 입력합니다.

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
VITE_SCHOOL_DOMAIN=knu.ac.kr
```

프런트엔드에는 공개 가능한 publishable/anon key만 넣습니다. **service_role 키는 넣지 않습니다.** 학교 도메인을 바꾸려면 클라이언트 환경 변수뿐 아니라 SQL의 `is_member`, `handle_new_user`, `before_user_created` 함수도 함께 수정해야 합니다.

6. `npm run build` 후 다시 배포합니다. Vite 환경 변수는 빌드 시 포함되므로 런타임 변수만 바꿔서는 적용되지 않습니다.
7. 실제 `knu.ac.kr` 계정 2개로 로그인 → 모집 → 지원 → 메시지 읽음 → 수락 → 링크 공개를 검증합니다. 연결 전에는 실제 이메일 인증, 운영 DB 정책, Realtime 연결을 검증했다고 볼 수 없습니다.

## 구현 기능

- 분야·역할·검색·최신순/마감 임박순·모집 중 필터, 관심 모집 저장
- 학교 이메일 매직링크 로그인, 닉네임·학과·학년·소개 수정
- 모집글 작성/조회/수정/삭제/조기 마감, 역할별 인원, 활동 시간·목표 필수
- 역할 하나를 선택해 지원, 기술 태그·경험·포트폴리오·지원 동기 작성
- 지원 1건당 1:1 면담, 실시간 갱신, 메시지 읽음, 새 메시지/선발 알림
- 모집자의 지원서 검토, 수락/거절, 지원자의 신청 취소
- 수락 시 정원 갱신·전체 역할 충족 시 자동 마감·시스템 안내 메시지
- 합류 확정된 지원자와 게시자만 팀 오픈채팅 링크 조회
- 모바일 레이아웃, 키보드 탐색, 대화상자 포커스 제어

## 데이터 및 보안 설계

- `profiles`, `posts`, `post_roles`, `applications`, `messages`, `post_secrets` 테이블을 사용합니다.
- `applications.id`가 1:1 면담방 식별자이므로 중복된 채팅방 테이블은 만들지 않았습니다.
- 비밀 링크는 `posts` 컬럼이 아니라 **별도 `post_secrets` 테이블**에 저장합니다. RLS는 행 단위이므로 공개 모집글과 비밀 링크를 분리해야 합니다.
- 테이블 직접 쓰기 권한을 제거하고 인증·참여자·상태 검사를 수행하는 RPC로만 변경합니다.
- 모집글 행 잠금으로 동시 지원/수락/수정/삭제를 직렬화합니다. 정원 조회와 수락은 하나의 DB 트랜잭션입니다.
- 본인 글 지원, 다른 글의 역할 지원, 중복 지원, 정원 초과 수락, 제3자 면담 접근, 수락 후 취소를 서버에서 차단합니다.
- 지원자가 생긴 모집글은 수정/삭제할 수 없으며 모집 마감만 가능합니다. 지원할 때 확인한 조건과 면담 기록을 보존하기 위한 정책입니다.
- 마감일은 한국 날짜로 판단합니다. 마감일이 지나면 새 지원은 닫히지만, 기존 지원자 선발은 계속할 수 있습니다. 게시자가 수동 마감하면 추가 수락도 닫힙니다.
- 링크 전달은 링크 자체를 메시지에 복제하지 않고 시스템 알림과 권한이 적용된 링크 조회 버튼으로 처리합니다.
- 관심 모집은 브라우저 로컬 저장입니다. 지원·선발·메시지는 Supabase 연결 시 서버에 저장됩니다.

## 배포

React + TypeScript + Vite 정적 프런트엔드와 Supabase 백엔드 구조입니다. 기획서의 기술 스택은 제안으로 보고 정적 호스팅과 배포 편의를 위해 Next.js 대신 Vite를 사용했습니다.

Sites는 `.openai/hosting.json`의 `dist`를 배포합니다. Vercel에서는 프로젝트 루트를 이 폴더로, 빌드 명령을 `npm run build`, 출력 폴더를 `dist`로 설정합니다. 서버 로직과 데이터 접근 제어는 Supabase에 있습니다.

## 참고 문서

- [Supabase 이메일 매직링크](https://supabase.com/docs/reference/javascript/auth-signinwithotp)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [가입 전 이메일 도메인 검사](https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook)

운영 전 필수 작업: Supabase 프로젝트 연결, SQL 적용, SMTP/리디렉션 설정, 실제 학생 2명 계정으로 접근 권한과 실시간 통신 확인. 신고/차단, 관리자 도구, 페이지네이션은 이번 MVP 범위에 포함하지 않았습니다.
