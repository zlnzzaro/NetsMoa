# Supabase 연동 가이드

이 가이드는 현재 모아 코드와 `knu.ac.kr` 학교 이메일 기준입니다. 프론트엔드는 `../frontend/`, 백엔드 SQL은 `supabase/migrations/001_initial.sql`에 있습니다.

별도의 Node 서버를 띄우지 않습니다. Supabase가 PostgreSQL, 이메일 인증, SQL 함수(RPC), 실시간 채팅 통신을 제공합니다. 이 폴더의 npm 의존성은 DB 테스트용이며 Supabase 연결 없이도 테스트할 수 있습니다.

## 1. Supabase 프로젝트 만들기

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인합니다.
2. New project에서 조직과 프로젝트 이름(예: `moa-knu`)을 선택합니다.
3. 데이터베이스 비밀번호를 정해 별도로 보관합니다. 프론트엔드 설정에는 이 비밀번호를 사용하지 않습니다.
4. 사용자와 가까운 제공 지역을 선택하고 프로젝트 생성이 끝날 때까지 기다립니다.
5. Connect 안내 또는 Project Settings의 API 관련 화면에서 **Project URL**과 **Publishable key**를 확인합니다.

필요한 값은 `https://...supabase.co` 형태의 API URL과 `sb_publishable_...` 형태의 공개 키입니다. 기존 프로젝트의 legacy `anon` 키도 현재 코드에서 사용할 수 있습니다. 변수 이름이 `VITE_SUPABASE_ANON_KEY`여도 publishable key를 넣을 수 있습니다. `sb_secret_...`, `service_role`, 데이터베이스 연결 문자열은 이 칸에 넣지 않습니다.

공개 키는 프로젝트를 식별하며 사용자별 권한은 로그인 세션과 RLS/RPC가 검사합니다. [공식 API 키 안내](https://supabase.com/docs/guides/api/api-keys)

## 2. DB 테이블·서버 함수·접근 정책 적용

**새 프로젝트 기준으로 최초 한 번만 실행합니다.** 기존에 모아 SQL을 적용했다면 폴더를 분리했다는 이유로 다시 실행할 필요가 없습니다.

1. 로컬 `backend/supabase/migrations/001_initial.sql` 파일을 엽니다.
2. 전체 내용을 복사합니다.
3. Supabase SQL Editor → New query에 붙여넣습니다.
4. 전체 쿼리를 실행합니다. 선택한 일부 줄만 실행하지 않도록 주의합니다.

생성되는 주요 테이블은 다음과 같습니다.

| 테이블         | 내용                                  |
| -------------- | ------------------------------------- |
| `profiles`     | 닉네임, 학과, 학년, 소개              |
| `posts`        | 공개 모집 정보                        |
| `post_roles`   | 역할과 모집 인원                      |
| `applications` | 지원서와 선발 상태, 면담방 식별자     |
| `messages`     | 면담 메시지와 읽음 시각               |
| `post_secrets` | 수락 이후에만 조회할 팀 오픈채팅 주소 |

SQL에는 데이터 변경용 RPC, RLS 정책, 학교 이메일 검사, Realtime publication 등록까지 들어 있습니다. 대시보드에서 별도로 모든 사용자에게 쓰기를 허용하는 정책을 추가하지 않습니다. 테이블 직접 쓰기를 막고 검사된 RPC로만 쓰도록 만든 구조입니다.

SQL Editor에서 아래 쿼리로 테이블과 RLS 설정을 확인할 수 있습니다. 6개 행의 `rls_enabled`가 모두 `true`여야 합니다.

```sql
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('profiles','posts','post_roles','applications','messages','post_secrets')
order by c.relname;
```

대시보드 관리자 계정은 보호된 데이터도 볼 수 있습니다. SQL Editor에서 조회된다는 사실은 일반 사용자의 RLS 우회 여부를 판단하는 근거가 아닙니다.

## 3. 이메일 로그인과 학교 도메인 제한

Authentication의 Sign In / Providers 또는 Providers 메뉴에서 Email을 활성화하고, 신규 가입 허용 및 이메일 확인(Confirm email)을 활성화합니다. UI 버전에 따라 메뉴 명칭이 다를 수 있습니다.

현재 앱은 비밀번호 입력 없이 이메일의 로그인 링크를 누르는 **매직링크** 방식입니다. 숫자 OTP를 입력하는 화면은 구현되어 있지 않습니다. [공식 이메일 로그인 안내](https://supabase.com/docs/guides/auth/auth-email-passwordless)

Authentication → Hooks에서 **Before User Created**를 추가합니다.

| 항목      | 설정                  |
| --------- | --------------------- |
| Hook 유형 | PostgreSQL function   |
| Schema    | `public`              |
| Function  | `before_user_created` |
| 활성화    | 켬                    |

함수가 목록에 없다면 2단계 SQL이 성공했는지 확인합니다. 함수 실행에 필요한 `supabase_auth_admin` 권한도 해당 SQL에 포함되어 있습니다. 별도의 Edge Function을 만들 필요는 없습니다.

현재 코드는 가입 전 훅과 `auth.users` 생성 트리거에서 `knu.ac.kr`를 검사하고, 보호된 RPC 호출 때도 이메일 확인 여부와 도메인을 다시 검사합니다. 다른 학교 도메인으로 바꿀 때는 프론트엔드 환경 변수와 SQL의 `is_member`, `handle_new_user`, `before_user_created` 세 함수를 함께 변경해야 합니다. [가입 전 훅 공식 문서](https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook)

## 4. 로그인 후 돌아올 주소 등록

Authentication → URL Configuration에서 설정합니다.

로컬 테스트를 먼저 한다면 Site URL을 `http://127.0.0.1:5173`으로 지정합니다. 실제 배포 후에는 최종 배포 주소로 변경합니다.

Redirect URLs에는 사용하는 주소를 각각 등록합니다.

```text
http://127.0.0.1:5173
http://localhost:5173
https://moa-knu-campus-team.astutewolf1025.chatgpt.site
```

`localhost`와 `127.0.0.1`은 서로 다른 주소입니다. 개발 서버가 5174 등 다른 포트로 실행되면 그 주소도 등록해야 합니다. Vercel로 옮긴다면 새 배포 주소를 추가합니다.

코드는 `emailRedirectTo: window.location.origin`을 사용합니다. 접속한 웹사이트의 루트 주소로 돌아오므로 별도의 `/auth/callback` 페이지를 만들 필요가 없습니다. [공식 리디렉션 설정](https://supabase.com/docs/guides/auth/redirect-urls)

Authentication → Email Templates에서 매직링크 이메일의 링크는 기본 `{{ .ConfirmationURL }}`을 유지하세요. 직접 수정한다면 다음처럼 사용할 수 있습니다.

```html
<h2>모아에 오신 것을 환영해요</h2>
<p>아래 버튼을 눌러 학교 이메일 인증과 로그인을 완료해 주세요.</p>
<a href="{{ .ConfirmationURL }}">모아 로그인하기</a>
```

`{{ .SiteURL }}`만 링크에 넣으면 인증 절차 없이 사이트로 이동할 수 있습니다. 현재 앱에는 숫자 OTP 입력 UI가 없으므로 템플릿을 숫자 코드만 표시하는 방식으로 바꾸지 않습니다. [공식 이메일 템플릿 안내](https://supabase.com/docs/guides/auth/auth-email-templates)

## 5. 인증 메일을 보내는 SMTP 설정

Supabase 기본 이메일 발송은 테스트 용도로 제한됩니다. 일반 학교 사용자에게 메일을 보내려면 **Custom SMTP**를 설정하는 경로로 진행하세요. 현재 허용 수신자와 발송 한도는 프로젝트 대시보드 및 [공식 SMTP 안내](https://supabase.com/docs/guides/auth/auth-smtp)에서 확인합니다.

1. 사용할 이메일 발송 업체에서 발신 도메인과 발신 주소를 인증합니다.
2. 업체가 제공한 DNS 레코드를 본인이 관리하는 도메인에 등록합니다.
3. Supabase Authentication의 Custom SMTP 설정에 아래 값을 입력합니다.

| Supabase 항목 | 넣을 값                                       |
| ------------- | --------------------------------------------- |
| Sender email  | 업체에서 인증한 발신 이메일                   |
| Sender name   | 예: `모아`                                    |
| Host          | 업체가 제공하는 SMTP 호스트                   |
| Port          | 업체가 안내하는 포트                          |
| Username      | SMTP 사용자명                                 |
| Password      | SMTP 비밀번호 또는 업체가 지정한 SMTP 인증 값 |

**학교 수신 이메일 제한과 발신 이메일 도메인은 별개**입니다. 수신자는 `@knu.ac.kr`이지만 발신자는 본인이 관리하는 서비스 도메인을 사용할 수 있습니다. 학교 도메인을 관리하지 않는다면 `noreply@knu.ac.kr`을 임의로 발신 주소에 넣지 마세요.

SMTP 인증 값은 Supabase 대시보드에 저장합니다. 프론트엔드 `.env.local`이나 Git에 넣지 않습니다. 발신 서비스를 등록하거나 유료 요금제를 결제하는 작업은 이 폴더 분리 과정에서 수행하지 않았습니다.

## 6. 프론트엔드에 URL과 공개 키 연결

PowerShell에서 프로젝트 루트로 이동합니다.

```powershell
Set-Location -LiteralPath 'C:\Users\suak0\OneDrive\Documents\ChatGPT\교내 공모전 팀원 모집 서비스\moa'
```

`frontend/.env.local`이 아직 없다면 예제 파일을 복사합니다. 기존 파일이 있다면 값을 유지한 채 편집합니다.

```powershell
if (-not (Test-Path -LiteralPath 'frontend/.env.local')) {
  Copy-Item -LiteralPath 'frontend/.env.example' -Destination 'frontend/.env.local'
}
notepad frontend/.env.local
```

다음 형식으로 **본인 프로젝트의 실제 값**을 입력합니다.

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
VITE_SCHOOL_DOMAIN=knu.ac.kr
```

파일 위치는 반드시 `moa/frontend/.env.local`입니다. 루트 `moa/.env.local`이나 `backend/.env.local`이 아닙니다. 이름 뒤에 `.txt`가 붙지 않았는지도 확인합니다.

루트에서 실행합니다.

```powershell
npm ci
npm run dev
```

이미 개발 서버가 켜져 있다면 종료한 뒤 다시 실행합니다. 연결되면 화면의 체험 모드 표시가 사라지고 실제 학교 이메일 로그인 버튼이 나타납니다. 기존 예시 모집글이 사라지고 빈 목록이 나오는 것은 정상입니다. 체험 데이터는 실제 DB로 자동 이전되지 않습니다.

## 7. 실시간 채팅 설정 확인

초기 SQL은 `supabase_realtime` publication에 다음 4개 테이블을 등록합니다.

```text
posts
post_roles
applications
messages
```

SQL Editor에서 등록 결과를 확인합니다.

```sql
select schemaname, tablename
from pg_publication_tables
where pubname = 'supabase_realtime'
order by schemaname, tablename;
```

`post_secrets`는 실시간 변경 배포 대상에 넣지 않습니다. 프론트엔드는 메시지와 지원 상태 변경을 감지해 권한이 적용된 RPC로 최신 데이터를 다시 조회합니다. 현재 구현은 Postgres Changes 방식을 사용합니다. [공식 Realtime 설정](https://supabase.com/docs/guides/realtime/postgres-changes)

## 8. 실제 학교 계정 두 개로 확인

서로 다른 `knu.ac.kr` 이메일 A와 B를 준비합니다. 같은 브라우저 프로필은 로그인 세션을 공유할 수 있으므로 서로 다른 브라우저 프로필 또는 일반 창과 시크릿 창을 사용합니다. 인증 이메일 링크도 각 계정에 사용할 브라우저에서 엽니다.

| 순서 | 확인할 동작                      | 정상 결과                                     |
| ---- | -------------------------------- | --------------------------------------------- |
| 1    | A가 이메일 링크로 로그인         | 프로필이 생성되고 화면에서 로그인 상태 표시   |
| 2    | A가 프로필 입력 후 모집글 작성   | DB `posts`, `post_roles`, `post_secrets` 생성 |
| 3    | B가 이메일 링크로 로그인 후 지원 | 지원서와 면담방 생성                          |
| 4    | A와 B가 메시지를 주고받음        | 새로고침 없이 메시지가 표시됨                 |
| 5    | 수락 전 B의 지원 현황 확인       | 팀 오픈채팅 버튼이 공개되지 않음              |
| 6    | A가 B를 수락                     | 확정 인원 증가, B에게 합류 확정 표시          |
| 7    | B가 팀 오픈채팅 버튼 클릭        | A가 입력한 링크를 열 수 있음                  |
| 8    | A/B가 새로고침                   | DB에 저장한 모집·지원·대화가 유지됨           |

Authentication → Users에서 계정과 이메일 확인 상태를 볼 수 있습니다. 실제 검증 전에 대시보드로 이메일을 강제 확인 처리하지 말고 정상 이메일 인증 흐름을 사용하세요.

백엔드 로컬 검사는 루트에서 `npm run test:backend` 또는 이 폴더에서 `npm test`로 실행합니다. 이 검사는 임시 PostgreSQL 엔진에서 수행되며 실제 Supabase 프로젝트 데이터를 변경하지 않습니다. 실제 이메일 수신과 Realtime 네트워크 통신은 위 두 계정 검증으로 확인해야 합니다.

## 9. 배포에 반영

로컬 연결만 바꾸면 현재 배포 사이트는 여전히 이전 데모 빌드입니다. 공개 환경 값을 포함해 새로 빌드하고 배포해야 합니다.

```powershell
# moa/ 루트에서 실행
npm run build
```

출력은 루트 `dist/`입니다. Supabase SQL 적용과 프론트엔드 배포는 별도 작업입니다. `npm run build`는 SQL을 원격 DB에 적용하지 않습니다.

현재 Sites 주소를 유지하는 경우 로컬 연결 검증 후 동일 Site의 새 버전을 배포합니다. Sites의 런타임 환경 변수만 변경해도 이미 생성된 Vite 번들은 바뀌지 않습니다.

현재 Site는 소유자 전용으로 배포되어 있습니다. 그 앞단의 ChatGPT 접근 제한과 앱 내부 학교 이메일 인증은 별개입니다. 다른 학생이 사용하는 서비스로 공개하려면 사이트 공개 범위를 별도로 결정해야 합니다. 이번 폴더 분리에서는 공개 범위를 변경하지 않습니다.

다른 정적 호스팅에 배포할 경우 프로젝트 루트를 `moa/`, 설치 명령을 `npm ci`, 빌드 명령을 `npm run build`, 출력 폴더를 `dist`로 지정하고 세 가지 `VITE_` 환경 값을 빌드 환경에 등록합니다. 새 사이트 주소를 Supabase URL Configuration에도 추가합니다.

## 자주 발생하는 문제

| 증상                                      | 먼저 확인할 것                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| 계속 체험 모드가 표시됨                   | `.env.local` 위치가 `frontend/`인지, URL/공개 키가 모두 있는지, 개발 서버를 재시작했는지    |
| 연결 후 모집글이 없음                     | 새 DB에는 체험 모집글이 없으므로 직접 모집글을 작성                                         |
| `Invalid API key` 또는 인증 요청 401      | URL과 공개 키가 같은 프로젝트의 값인지, secret 키나 DB 비밀번호를 넣지 않았는지             |
| `load_state` 함수를 찾을 수 없음          | 초기 SQL이 현재 URL의 프로젝트에 성공적으로 적용되었는지                                    |
| `relation ... already exists`             | 이미 적용된 초기 SQL을 다시 실행했는지; 테이블을 삭제해 해결하지 말고 적용 상태 확인        |
| 인증 메일이 오지 않음                     | Auth 로그, SMTP 설정, 발신 도메인 인증, 허용 수신자/발송 한도, 학교 메일 스팸함             |
| `Database error saving new user`          | SQL 실행 결과, `handle_new_user` 트리거 로그, 허용 도메인과 실제 이메일 확인                |
| 메일 링크가 다른 사이트로 이동            | Site URL, Redirect URLs, 이메일 템플릿, 실제 접속 주소와 포트                               |
| 메일을 눌렀는데 원래 창이 로그인되지 않음 | 인증 링크가 다른 브라우저에서 열렸는지; 링크를 연 브라우저의 세션 확인                      |
| 메시지가 새로고침 후에만 나타남           | publication의 4개 테이블 등록, 로그인 상태, 브라우저 WebSocket 연결과 콘솔                  |
| `permission denied` 또는 RLS 오류         | 사용하는 공개 키, SQL 함수 권한, 로그인·이메일 확인 상태; RLS를 끄는 방식으로 해결하지 않음 |
| 사이트 앞에서 ChatGPT 로그인 요구         | Sites 자체의 비공개 접근 제한; Supabase 학교 인증 설정과 별개                               |

외부 설정을 적용하기 전에는 실제 Supabase 운영 연결이 완료된 상태가 아닙니다. 현재 저장소는 연동 코드와 SQL을 제공하며, 실제 프로젝트 생성·SMTP 설정·학교 계정 이메일 수신 확인은 위 절차에 따라 진행해야 합니다.
