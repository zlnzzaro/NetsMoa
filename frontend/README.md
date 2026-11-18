# NETogether frontend

React + Vite로 만든 웹 화면.
백엔드 API가 완성되기 전까지는 mocks/의 가짜 데이터로 화면 구성할 예정.

## 실행 방법
```
cd frontend
npm install      # 처음 한 번
npm run dev      # http://localhost:5173
```

## 폴더 구조
- src/pages/       화면 하나 = 파일 하나
- src/components/  여러 화면이 같이 쓰는 부품
  - post/          팀원 모집글 관련
  - application/   지원·승인 관련
  - common/, layout/  공통
- src/api/         서버 호출 함수 모음
- src/mocks/       백엔드 완성 전 가짜 데이터 -> 백엔드 연결 후 api연결
- src/constants/   분류·역할 이름 (DB와 동일하게)

## 브랜치 규칙
- 각자 frontend-이름 브랜치에서 작업
- 작업 시작 전 git pull origin main
- 기능 하나 끝나면 main으로 PR
- 공통 파일(App.jsx, package.json)은 고치기 전에 말해 주기

## 백엔드 연결 방법 (mock → 실제 API)

지금은 백엔드 API가 없어서 src/mocks/의 가짜 데이터 사용.
화면(pages/)은 데이터를 직접 가져오지 않고 항상 src/api/의 함수만 부름.
그래서 API가 생기면 api/ 파일만 바꾸면 되고, 화면 코드는 그대로.


### 바꾸는 순서
1. 백엔드 담당자에게 주소와 응답 형식을 확인
2. src/api/ 해당 함수에서 mock을 지우고 fetch로 바꿈
3. 화면이 똑같이 나오는지 확인
4. 아래 표의 상태를 "연결됨"으로 바꾼다

### 연결 현황
| 기능 | api 파일 | 백엔드 담당 | 상태 |
|---|---|---|---|
| 모집글 목록 | posts.js | 백엔드 1 | mock (API 있음, id 추가 필요) |
| 모집글 상세 | posts.js | 백엔드 1 | mock |
| 모집글 등록 | posts.js | 백엔드 1 | mock |
| 로그인·프로필 | auth.js | 백엔드 2 | mock |
| 역할 지원 | applications.js | 백엔드 2 | mock |
| 지원자 승인·거절 | applications.js | 백엔드 2 | mock |
| 팀 채팅 링크 | applications.js | 백엔드 2 | mock |

### 규칙
- mock 데이터의 필드 이름과 값은 DB와 똑같이 맞춤 
(예: 분류 STUDY, 역할 BACKEND, id는 문자열)
- mocks/ 폴더는 모든 기능이 연결되고 시연 준비가 끝나면 지우기