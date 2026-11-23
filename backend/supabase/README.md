# NETogether × Supabase

별도 서버 없이 Supabase(PostgreSQL + Auth + Realtime)를 백엔드로 써요.
읽기는 RLS가 걸린 테이블을 직접 조회하고, 쓰기는 권한을 검사하는 RPC 함수로만 해요.

| 파일 | 내용 |
| --- | --- |
| `schema.sql` | 테이블, RLS, RPC 함수, 가입 트리거, Realtime 설정 |
| `seed.sql` | 시연용 계정 23개 + 모집글 12개 (`frontend/src/mocks/data.js` 와 같은 내용) |

## 처음 한 번 설정

1. [Supabase](https://supabase.com/dashboard)에서 New project를 만들어요. 리전은 Northeast Asia (Seoul)를 골라요.
2. **SQL Editor → New query**에 `schema.sql` 전체를 붙여 넣고 Run을 눌러요.
3. 새 쿼리에 `seed.sql` 전체를 붙여 넣고 Run을 눌러요. 시연 데이터가 필요 없으면 이 단계는 건너뛰어요.
4. **Authentication → Sign In / Providers → Email**에서 **Confirm email을 꺼요.**
   Supabase 기본 메일 발송은 한 시간에 몇 통밖에 못 보내서, 켜 두면 가입이 막혀요.
   (메일 인증이 필요하면 Custom SMTP를 설정한 뒤 켜요.)
5. **Project Settings → API**에서 Project URL과 `anon`(publishable) 키를 복사해요.
6. `frontend/.env.local`에 값을 넣어요. 형식은 `frontend/.env.example`을 참고해요.

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... 또는 sb_publishable_...
```

`.env.local`이 없으면 frontend는 가짜 데이터로 돌아가는 **체험 모드**로 떠요.

## 시연 계정

모든 계정의 비밀번호는 `netogether1234`예요.

- `yujin@netogether.dev`: 유진, 지원자 시점
- `seojun@netogether.dev`: 박서준, '캠퍼스 중고거래 웹' 모집글 작성자 (지원자 관리·합류 확정)

시연 데이터만 지우려면 `delete from auth.users where email like '%@netogether.dev';`를 실행해요.

## 규칙 요약

- **회원가입**: 가입하면 트리거가 `profiles`를 만들어요. 닉네임이 겹치면 뒤에 숫자를 붙여요.
- **공개 범위**: 프로필에서 공개되는 칼럼은 닉네임·소개·기술스택·희망 역할·사진뿐이에요. 학번과 이메일은 `get_me()`로 본인만 볼 수 있어요.
- **지원서 열람**: 합류 확정된 지원은 팀원 표시용으로 공개해요. 나머지 지원과 면담 메시지는 지원자와 작성자만 볼 수 있어요.
- **팀 채팅 링크**: `team_spaces`에 있고, 작성자와 확정된 팀원만 볼 수 있어요.
- **합류 확정(`accept_application`)**: 역할 정원이 차면 남은 지원자를 선발 종료로 바꿔요. 모든 역할이 차면 모집을 마감해요.
- **되돌리기(`undo_application`)**: 지원을 다시 검토 대기로 바꾸고 모집을 다시 열어요.
