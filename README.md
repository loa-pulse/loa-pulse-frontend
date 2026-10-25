# LoaPulse Frontend

> 로스트아크 거래소 시세를 실시간으로 추적하고, 원하는 가격이 되면 디스코드로 알려주는 서비스의 프론트엔드

기획과 설계는 [loa-pulse-docs](https://github.com/loa-pulse/loa-pulse-docs)에 있다.

## 기술 스택

| 영역          | 선택                                      |
| ------------- | ----------------------------------------- |
| 빌드          | Vite, TypeScript                          |
| UI            | React, shadcn/ui (Radix), Tailwind CSS v4 |
| 서버 상태     | TanStack Query                            |
| 라우팅        | React Router                              |
| 코드 품질     | ESLint, Prettier                          |
| 패키지 매니저 | pnpm (`packageManager` 필드로 버전 고정)  |

선택 이유는 [D7](https://github.com/loa-pulse/loa-pulse-docs/blob/main/design/decisions.md)을 따른다.

## 실행

필요한 것: Node 24 (`.nvmrc`), pnpm (`corepack enable`로 `packageManager` 버전을 사용)

```bash
pnpm install
pnpm dev
```

개발 서버는 `/api` 요청을 `http://localhost:8080`(백엔드)으로 넘긴다.

## 스크립트

| 명령                                | 내용                      |
| ----------------------------------- | ------------------------- |
| `pnpm dev`                          | 개발 서버                 |
| `pnpm build`                        | 타입 검사 후 빌드         |
| `pnpm lint`                         | ESLint                    |
| `pnpm format` / `pnpm format:check` | Prettier 서식 적용 / 검사 |

CI는 PR과 `main` push마다 `lint`, `format:check`, `build`를 실행한다.

## 폴더 구조

```
src/
├── components/ui/   shadcn/ui 컴포넌트 (pnpm dlx shadcn add <이름>)
├── lib/             공통 유틸리티, QueryClient
├── pages/           라우트별 페이지
├── App.tsx          공통 레이아웃
└── main.tsx         진입점 (라우터, Provider)
```

shadcn/ui 컴포넌트를 추가한 뒤에는 `cn`을 `@/lib/utils`에서 가져오는지 확인한다 (생성기가 `cn` 패키지를 직접 import할 수 있다).

## 브랜치 전략

`main`과 작업 브랜치(`feat/...`, `fix/...`)로 운영하고, PR은 머지 커밋으로 합친다 ([D25](https://github.com/loa-pulse/loa-pulse-docs/blob/main/design/decisions.md)).
