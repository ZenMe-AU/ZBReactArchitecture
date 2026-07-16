# ZENME 한국어 온보딩 가이드

이 문서는 이 레포를 처음 보는 개발자가 "이 프로젝트가 무엇인지", "왜 이렇게 나뉘어 있는지", "어디부터 읽으면 되는지", "로컬에서는 어떻게 이해하고 실행하면 되는지"를 빠르게 파악할 수 있도록 만든 한국어 온보딩 가이드입니다.

## 1. 이 프로젝트를 한 줄로 설명하면

이 레포는 하나의 완성형 서비스라기보다, 여러 아키텍처 패턴을 실제 코드로 보여주는 **모듈형 풀스택 템플릿/샘플 플랫폼**에 가깝습니다.

핵심 포인트는 다음과 같습니다.

- 프런트엔드는 하나의 포털처럼 보이지만 기능별로 모듈이 나뉘어 있습니다.
- 백엔드는 기능별로 Azure Functions 앱이 따로 존재합니다.
- 같은 "질문/답변" 도메인을 서로 다른 아키텍처 방식으로 구현한 예제가 들어 있습니다.
- 그래서 이 레포는 제품 코드이기도 하지만, 동시에 아키텍처 학습용 레퍼런스이기도 합니다.

## 2. 이 프로젝트를 이해하는 가장 쉬운 관점

이 프로젝트는 "질문 기능을 여러 방식으로 구현해 본 실험장"이라고 생각하면 이해가 쉽습니다.

- `quest3Tier`: 가장 단순한 동기식 구조
- `quest5Tier`: 큐를 끼운 비동기 구조
- `quest5TierEg`: CQRS + 이벤트 기반 구조

즉, 기능은 비슷하지만 구현 방식이 다릅니다. 이 차이를 비교하면서 보면 레포 구조가 훨씬 자연스럽게 읽힙니다.

## 3. 큰 그림 구조

### 3.1 루트 기준 주요 폴더

- `ui/`
  - 메인 포털 프런트엔드 호스트입니다.
  - 로그인, 공통 레이아웃, 전역 라우팅을 담당합니다.
- `module/`
  - 기능별 풀스택 모듈이 들어 있습니다.
  - 각 모듈은 보통 `func/`와 `ui/`를 가집니다.
- `deploy/`
  - Azure 배포, 로컬 개발 인프라, 초기화 스크립트가 들어 있습니다.
- `Documentation/`
  - 시스템 개요, 아키텍처 패턴, 의사결정 문서가 들어 있습니다.

### 3.2 모듈 안의 기본 구조

대부분의 모듈은 아래 구조를 따릅니다.

- `func/`
  - Azure Functions 기반 백엔드
  - API 라우트, 핸들러, 서비스, 리포지토리, DB 모델, 마이그레이션 포함
- `ui/`
  - 해당 기능 전용 프런트엔드 화면/라우트

백엔드 `func/` 안은 보통 이렇게 읽으면 됩니다.

- `route.js` 또는 진입 라우트 파일
- `handler/`
- `service/`
- `repository/`
- `repository/model/`
- `deploy/db/migration/`

즉, "라우트 -> 핸들러 -> 서비스 -> 저장소 -> DB" 순서로 읽으면 됩니다.

## 4. 현재 모듈별 역할

### 4.1 `profile`

역할:

- 사용자 프로필
- 로그인/인증
- 토큰 검증

중요 포인트:

- 프런트 로그인 흐름과 백엔드 인증 진입점 역할을 합니다.
- 메인 호스트가 가장 먼저 의존하는 지원 모듈입니다.
- `ui/auth/msalInstance.ts`와 `module/profile/func`를 같이 보면 인증 흐름이 보입니다.

### 4.2 `coordinate`

역할:

- 좌표/위치 관련 기능
- 위치 기반 사용자 조회

중요 포인트:

- 단순 CRUD처럼 보이지만 공간 질의가 들어가서 PostGIS가 필요합니다.
- 로컬 DB를 일반 Postgres가 아니라 PostGIS 이미지로 바꾼 이유가 이 모듈 때문입니다.

### 4.3 `quest3Tier`

역할:

- 질문/답변 기능의 가장 단순한 구현 예제

아키텍처 관점:

- 기본적인 동기식 3-tier 스타일에 가장 가깝습니다.
- UI -> API -> DB 흐름을 이해하기 가장 좋습니다.

처음 읽을 때 추천 이유:

- 가장 단순합니다.
- "이 레포에서 한 기능이 끝까지 어떻게 이어지는지" 보기 좋습니다.

### 4.4 `quest5Tier`

역할:

- 질문/답변 기능의 비동기 처리 버전

아키텍처 관점:

- UI -> API -> Queue -> Business Functions -> DB
- 일부 작업은 즉시 처리하고, 일부는 큐를 통해 비동기로 처리합니다.

중요 포인트:

- Service Bus emulator가 로컬에서 필요합니다.
- 큐를 넣어서 API와 비즈니스 처리를 느슨하게 분리한 예제입니다.

### 4.5 `quest5TierEg`

역할:

- 질문/답변 기능의 CQRS + 이벤트 기반 예제

아키텍처 관점:

- 조회(Query)와 변경(Command)를 분리합니다.
- 변경은 이벤트 흐름으로 처리하고, 이벤트 기록/추적성을 강조합니다.

중요 포인트:

- 세 모듈 중 가장 복잡합니다.
- 가장 나중에 읽는 것이 좋습니다.

## 5. 프런트엔드는 어떻게 조립되는가

현재 코드 기준으로 프런트는 **호스트 + 기능 리모트** 구조입니다.

### 5.1 호스트

- `ui/`가 메인 호스트입니다.
- 실제 최상위 라우팅은 [ui/app/routes.ts](../ui/app/routes.ts) 에 있습니다.

현재 큰 라우트는 다음처럼 이해하면 됩니다.

- `/login`
- `/profile`
- `/quest3Tier/*`
- `/quest5Tier/*`
- `/quest5TierEg/*`

### 5.2 리모트 모듈

호스트는 각 기능 모듈을 lazy loading 합니다.

- `quest3TierRemote`
- `quest5TierRemote`
- `quest5TierEgRemote`

관련 파일:

- [ui/app/routes/remotes/Quest3TierRemote.tsx](../ui/app/routes/remotes/Quest3TierRemote.tsx)
- [ui/app/routes/remotes/Quest5TierRemote.tsx](../ui/app/routes/remotes/Quest5TierRemote.tsx)
- [ui/app/routes/remotes/Quest5TierEgRemote.tsx](../ui/app/routes/remotes/Quest5TierEgRemote.tsx)
- [ui/vite.config.ts](../ui/vite.config.ts)

즉, 사용자는 하나의 사이트를 보지만 내부적으로는 기능별 프런트가 분리되어 붙는 구조입니다.

## 6. 백엔드는 어떻게 나뉘는가

이 레포의 백엔드는 "하나의 큰 서버"가 아니라 **모듈별 Azure Functions 앱 여러 개**라고 보면 됩니다.

현재 로컬 기준 대표 포트:

- `profile`: `7072`
- `coordinate`: `7073`
- `quest3Tier`: `7074`
- `quest5Tier`: `7075`
- `quest5TierEg`: `7076`

프런트는 이 함수앱들을 각 기능의 API 도메인으로 호출합니다.

## 7. 로컬 개발 환경을 어떻게 이해하면 되는가

### 7.1 필수 구성요소

로컬에서 이 프로젝트를 이해할 때는 아래 4가지를 같이 봐야 합니다.

1. 프런트 호스트/리모트
2. Azure Functions 앱들
3. PostgreSQL/PostGIS
4. Azure 로컬 에뮬레이터

### 7.2 현재 로컬 인프라 맵

현재 로컬 개발 기준 기본 구성은 아래와 같습니다.

- 메인 UI 호스트: `http://localhost:5173`
- UI 리모트:
  - `5174` `quest3Tier`
  - `5175` `quest5Tier`
  - `5176` `quest5TierEg`
- Postgres/PostGIS: `localhost:55432`
- pgAdmin: `http://localhost:5050`
- Service Bus emulator: `5672`
- Service Bus 관리 포트: `5300`
- Azurite:
  - Blob `10000`
  - Queue `10001`
  - Table `10002`

### 7.3 왜 DB 포트가 5432가 아닌가

이 워크스페이스에서는 로컬 Mac에 기존 Postgres가 이미 떠 있을 가능성이 높아서, 충돌을 피하려고 로컬 DB 포트를 `55432`로 사용합니다.

### 7.4 왜 PostGIS를 쓰는가

`coordinate` 모듈의 공간 질의/좌표 처리를 로컬에서도 정상적으로 돌리려면 PostGIS가 필요합니다.

### 7.5 빠른 시작 순서

처음 로컬에서 올릴 때는 보통 아래 순서로 생각하면 됩니다.

1. 루트에서 의존성 설치
   - `pnpm install`
2. 로컬 DB 기동
   - `cd deploy/localDev/db`
   - `make start`
   - `make db`
3. 로컬 메시징/스토리지 에뮬레이터 준비
   - Service Bus emulator
   - Azurite
4. 각 모듈 DB 마이그레이션 실행
   - 예: 각 `module/*/func` 안에서 `npx sequelize-cli db:migrate`
5. 각 Functions 앱 실행
   - 각 `module/*/func` 안에서 `pnpm run start`
6. 프런트 실행
   - `ui/`에서 `pnpm run dev:federation`

실무적으로는 모든 모듈을 한 번에 이해하려고 하기보다, 먼저 `quest3Tier`와 `profile`만 올려서 하나의 사용자 흐름을 확인한 뒤 나머지를 붙이는 식이 훨씬 쉽습니다.

### 7.6 각 모듈은 보통 이런 스크립트를 갖고 있다

대부분의 함수앱 모듈은 아래 패턴을 가집니다.

- `pnpm run setup:local`
  - 로컬용 `local.settings.json`을 맞추는 역할
- `pnpm run start`
  - Azure Functions host 실행
- `npx sequelize-cli db:migrate`
  - 해당 모듈 DB 스키마 반영

즉, "설정 생성 -> 마이그레이션 -> 함수앱 실행" 흐름으로 이해하면 됩니다.

## 8. 처음 읽을 때 추천 순서

아래 순서가 가장 덜 헷갈립니다.

### 1단계: 루트와 개요 파악

- [README.md](../README.md)
- [Documentation/Overview.md](./Overview.md)

목표:

- 이 레포가 "모듈형 플랫폼 + 아키텍처 샘플"이라는 감을 잡기

### 2단계: 가장 쉬운 모듈 하나 끝까지 보기

- `quest3Tier/ui`
- `quest3Tier/func`

추천 읽기 순서:

1. [ui/app/routes.ts](../ui/app/routes.ts)
2. [module/quest3Tier/ui/routes.ts](../module/quest3Tier/ui/routes.ts)
3. `module/quest3Tier/ui/routes/*`
4. `module/quest3Tier/ui/api/*`
5. `module/quest3Tier/func/route.js`
6. `module/quest3Tier/func/handler/*`
7. `module/quest3Tier/func/service/*`
8. `module/quest3Tier/func/repository/*`

목표:

- "버튼/화면 -> API 호출 -> 함수앱 -> 서비스 -> DB" 전체 연결 이해하기

### 3단계: 지원 모듈 이해

- `profile`
- `coordinate`

목표:

- 인증과 위치 기능이 메인 기능 모듈과 어떻게 연결되는지 파악하기

### 4단계: 비동기 구조 이해

- [module/quest5Tier/README.md](../module/quest5Tier/README.md)
- `quest5Tier/func`

목표:

- 왜 큐가 들어가는지
- 동기 처리와 비동기 처리가 어떻게 섞이는지 이해하기

### 5단계: CQRS/Event 기반 구조 이해

- [module/quest5TierEg/README.md](../module/quest5TierEg/README.md)
- [Documentation/ArchitecturePatterns/CQRS.md](./ArchitecturePatterns/CQRS.md)

목표:

- 읽기와 쓰기를 왜 분리하는지
- 이벤트 추적/감사 가능성이 왜 중요한지 이해하기

## 9. 기능 하나를 수정할 때 어디를 보면 되는가

### UI를 바꾸고 싶을 때

- 화면: `module/<modulename>/ui/routes/*`
- API 호출: `module/<modulename>/ui/api/*`
- 호스트 연결: `ui/app/routes.ts`

### API 동작을 바꾸고 싶을 때

- 진입 라우트: `module/<modulename>/func/route.js`
- 요청 처리: `handler/`
- 비즈니스 로직: `service/`
- DB 접근: `repository/`

### DB 스키마를 바꾸고 싶을 때

- 마이그레이션: `module/<modulename>/func/deploy/db/migration/`

### 로컬 설정을 바꾸고 싶을 때

- 함수앱 설정 생성: `module/<modulename>/func/deploy/localDev/`
- 함수앱 로컬 값: `module/<modulename>/func/local.settings.json`
- 프런트 로컬 env: `ui/public/env.json`
- DB 도커 설정: `deploy/localDev/db/`
- Service Bus emulator 설정: `deploy/localDev/serviceBus/`

## 10. 자주 헷갈리는 포인트

### 10.1 이 레포는 완성형 제품 문서보다 아키텍처 샘플 성격이 더 강합니다

그래서 일부 README는 짧거나, 오래된 설명이 남아 있거나, Windows/VS Code 기준으로 적혀 있을 수 있습니다.

### 10.2 문서와 현재 코드가 완전히 일치하지 않는 부분이 있습니다

예를 들어 일부 아키텍처 문서는 예전 모듈명 `questionV1`, `questionV2`를 쓰고 있습니다. 현재 코드 기준으로는 `quest3Tier`, `quest5Tier`, `quest5TierEg`로 읽는 것이 맞습니다.

### 10.3 프런트는 "한 앱"처럼 보이지만 내부는 여러 모듈입니다

사용자 입장에서는 하나의 포털이지만, 개발자 입장에서는 호스트와 기능 리모트를 같이 봐야 합니다.

### 10.4 로컬 실행은 문서보다 실제 설정 파일이 더 중요합니다

다음 파일들이 현재 로컬 진실 소스에 가깝습니다.

- `deploy/localDev/db/docker/config.env`
- `deploy/localDev/db/docker/docker-compose.yml`
- `deploy/localDev/serviceBus/config.json`
- 각 모듈의 `local.settings.json`
- `ui/public/env.json`

## 11. 이 프로젝트를 이해한 뒤의 다음 단계

온보딩이 끝나면 보통 아래 순서로 진행하면 됩니다.

1. `quest3Tier` 요청 하나를 UI부터 DB까지 추적해 보기
2. 같은 기능을 `quest5Tier`에서 비교해 보기
3. `quest5TierEg`에서 CQRS 차이를 비교해 보기
4. `profile` 인증 흐름을 별도로 따라가 보기
5. 새 기능을 어떤 패턴으로 구현할지 결정하기

## 12. 추천 참고 문서

- [Overview.md](./Overview.md)
- [ArchitecturePatterns/Basic3TierStructure.md](./ArchitecturePatterns/Basic3TierStructure.md)
- [ArchitecturePatterns/EventDrivenArchitecture.md](./ArchitecturePatterns/EventDrivenArchitecture.md)
- [ArchitecturePatterns/CQRS.md](./ArchitecturePatterns/CQRS.md)
- [module/quest5Tier/README.md](../module/quest5Tier/README.md)
- [module/quest5TierEg/README.md](../module/quest5TierEg/README.md)
- [ui/README.md](../ui/README.md)
- [deploy/localDev/db/README.md](../deploy/localDev/db/README.md)
- [deploy/localDev/serviceBus/README.md](../deploy/localDev/serviceBus/README.md)

## 13. 한 문장으로 다시 정리

이 레포는 "기능별로 분리된 프런트/백엔드 모듈 위에서, 같은 도메인을 여러 아키텍처 방식으로 구현해 보는 Azure Functions + React 기반 샘플 플랫폼"이라고 이해하면 가장 정확합니다.
