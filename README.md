# 가로 스크롤 카드 섹션 구현

PC 환경에서는 세로 스크롤을 카드 리스트의 가로 이동으로 전환하고, Tablet/Mobile 환경에서는 네이티브 가로 스크롤을 제공하는 가로 스크롤 카드 섹션 구현 과제입니다.

## 프로젝트 개요

페이지를 다음과 같은 실제 페이지 흐름으로 구성했습니다.

```text
[Dummy Section]
      ↓
[Horizontal Case Section]
      ↓
[Dummy Section]
```

PC 환경에서는 가로 스크롤 섹션이 화면 중앙에 도달하면 섹션을 고정하고, 세로 스크롤 진행에 따라 카드 트랙이 가로로 이동하도록 구현했습니다.

Tablet/Mobile 환경에서는 PC의 스크롤 하이재킹을 사용하지 않고, 터치 환경에 적합한 네이티브 가로 스크롤 방식으로 전환했습니다.

### 주요 구현 사항

- PC(1025px 이상)
  - 세로 스크롤 → 가로 스크롤 변환
  - 섹션이 뷰포트 중앙에 도달했을 때 인터랙션 시작
  - GSAP ScrollTrigger를 이용한 section pin
  - 스크롤 진행률에 따른 카드 트랙 이동
  - 카드 내부 이미지 트랙의 별도 가로 이동
  - 스크롤 종료 후 다음 콘텐츠로 자연스럽게 연결

- Tablet/Mobile(1024px 이하)
  - 네이티브 가로 스와이프 지원
  - 카드 영역과 카드 내부 이미지 영역을 각각 가로 스크롤 가능하도록 구성

- 공통
  - 카드 데이터를 배열 기반으로 관리
  - React의 map을 이용한 데이터 기반 렌더링
  - 콘텐츠 최대 폭 1400px 적용
  - PC 20px / Tablet·Mobile 10px 좌우 padding 적용
  - 브라우저 크기 변경에 대응할 수 있도록 실제 DOM 크기를 기반으로 스크롤 거리 계산

---

## 기술 스택

- React
- TypeScript
- Vite
- GSAP
- GSAP ScrollTrigger
- CSS

---

## 기술 선택 이유

### React + TypeScript

카드와 이미지 데이터를 하드코딩하지 않고 배열 기반으로 관리해야 하기 때문에 React의 데이터 기반 렌더링 방식이 적합하다고 판단했습니다.

현재 `caseItems`를 기준으로 `HorizontalCaseSection`에서 카드와 내부 사진 목록을 렌더링합니다.

```tsx
{
  items.map((item) => (
    <div key={item.id} className="story-item">
      ...
      {item.photos.map((photo) => (
        <div key={photo.id} className="photo-card">
          ...
        </div>
      ))}
    </div>
  ));
}
```

이를 통해 카드 수나 각 카드의 사진 수가 변경되어도 컴포넌트의 렌더링 로직을 수정하지 않고 데이터만 변경할 수 있도록 구성했습니다.

TypeScript에서는 `CaseItem`, `PhotoItem` 타입을 정의하여 카드 데이터 구조를 명확하게 관리했습니다.

### GSAP + ScrollTrigger

이 과제는 단순히 섹션이 화면에 진입했는지를 감지하는 것보다, 세로 스크롤 진행률에 따라 가로 이동을 연속적으로 제어하는 것이 핵심이라고 판단했습니다.

`IntersectionObserver`는 진입 여부를 감지하는 데는 유용하지만, 이 과제는 스크롤 구간 전체를 따라 애니메이션을 제어해야 하므로 ScrollTrigger가 더 적합하다고 판단했습니다.

`ScrollTrigger`를 통해 다음 동작을 하나의 스크롤 기반 인터랙션으로 구성했습니다.

- `start: "center center"`를 이용한 화면 중앙 기준 시작
- `pin: true`를 이용한 섹션 고정
- `scrub`을 이용한 스크롤과 애니메이션의 연동
- 가로 트랙의 `translateX` 이동
- 카드 내부 이미지 트랙의 추가 이동
- `invalidateOnRefresh`를 이용한 refresh 시 거리 재계산

실제 콘텐츠의 크기를 기준으로 가로 스크롤 거리를 계산하여, 카드 개수가 변경되어도 스크롤 영역이 함께 계산되도록 구현했습니다.

```ts
const getOuterDistance = () => {
  return Math.max(track.scrollWidth - wrap.clientWidth, 0);
};

const getInnerDistance = (storyItem: HTMLElement) => {
  ...
  return Math.max(photoTrack.scrollWidth - photoZone.clientWidth, 0);
};
```

이를 통해 카드 개수나 내부 이미지 개수가 변경되더라도 고정된 픽셀 값을 사용하는 대신 실제 콘텐츠 크기를 기준으로 이동 거리를 계산합니다.

---

## 구현 구조

### PC 스크롤 구조

PC에서는 다음과 같은 구조로 동작합니다.

```text
Vertical Scroll
      ↓
ScrollTrigger
      ↓
Section Pin
      ↓
GSAP Timeline
      ↓
Story Track X 이동
      ↓
Story 내부 Photo Track X 이동
```

각 `story-item`마다 외부 트랙과 내부 사진 트랙의 이동을 timeline에 순차적으로 등록했습니다.

```ts
storyItems.forEach((storyItem, index) => {
  if (index > 0) {
    timeline.to(track, {
      x: () => getItemX(storyItem),
      ...
    });
  }

  const photoTrack = storyItem.querySelector(".photo-track");

  if (!photoTrack) return;

  timeline.to(photoTrack, {
    x: () => -getInnerDistance(storyItem),
    ...
  });
});
```

이를 통해 하나의 master timeline 안에서 외부 트랙과 내부 트랙의 이동 순서를 관리합니다.

---

## 반응형 대응

브레이크포인트는 요구사항에 맞춰 다음과 같이 구분했습니다.

```text
PC
min-width: 1025px

Tablet / Mobile
max-width: 1024px
```

### PC

PC에서는 `ScrollTrigger`를 활성화하여 세로 스크롤을 가로 이동으로 변환합니다.

```ts
desktop: "(min-width: 1025px)";
```

섹션이 화면 중앙에 도달하면 고정되고, 스크롤 진행에 따라 가로 트랙이 이동합니다.

### Tablet / Mobile

1024px 이하에서는 PC의 스크롤 하이재킹을 사용하지 않습니다.

터치 환경에서 세로 스와이프를 가로 이동으로 강제로 변환하면 사용자가 일반적인 페이지 스크롤을 하기 어려워질 수 있다고 판단했기 때문입니다.

따라서 모바일에서는 브라우저의 네이티브 가로 스크롤을 사용했습니다.

```css
.horizontal-track-wrap {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
}
```

카드 내부의 사진 영역도 별도의 가로 스크롤 영역으로 구성했습니다.

```css
.story-photo-zone {
  overflow-x: auto;
  overflow-y: hidden;
  touch-action: pan-x;
}
```

이 방식으로 모바일에서는 사용자가 손가락으로 직접 카드를 좌우로 스와이프할 수 있도록 했습니다.

---

## 콘텐츠 최대 폭 및 Padding

레이아웃 조건에 맞춰 콘텐츠 영역과 좌우 padding을 분리했습니다.

```css
.content-padding {
  width: 100%;
  padding-inline: 20px;
  box-sizing: border-box;
}

.content-area {
  width: 100%;
  max-width: 1400px;
  margin-inline: auto;
}
```

PC에서는 20px, Tablet/Mobile에서는 10px의 좌우 padding을 적용했습니다.

```css
@media (max-width: 1024px) {
  .content-padding {
    padding-inline: 10px;
  }
}
```

`content-area`에 `max-width: 1400px`를 적용하고 padding을 별도의 wrapper에서 관리하여, 넓은 viewport에서도 콘텐츠 자체는 최대 1400px을 유지하도록 구성했습니다.

---

## 프로젝트 구조

```text
src/
├─ components/
│  └─ HorizontalCaseSection.tsx
│
├─ fixtures/
│  └─ caseData.ts
│
├─ pages/
│  └─ MainPage.tsx
│
├─ types/
│  └─ caseData.ts
│
├─ App.css
├─ App.tsx
├─ index.css
└─ main.tsx
```

### 각 파일의 역할

#### `HorizontalCaseSection.tsx`

가로 스크롤 카드 섹션의 핵심 컴포넌트입니다.

- 카드 데이터 렌더링
- GSAP Timeline 구성
- ScrollTrigger 설정
- 외부 가로 이동 거리 계산
- 내부 가로 이동 거리 계산
- PC / Mobile 반응형 인터랙션 분기

를 담당합니다.

#### `caseData.ts`

카드 콘텐츠를 배열 형태로 관리합니다.

컴포넌트의 렌더링 로직과 실제 데이터를 분리하기 위한 fixture 데이터입니다.

#### `caseData.ts` (types)

`CaseItem`, `PhotoItem` 타입을 정의합니다.

#### `MainPage.tsx`

더미 콘텐츠와 가로 스크롤 섹션을 실제 페이지 흐름 안에서 배치합니다.

```tsx
<div className="page-shell">
  <main className="page-flow">
    <section className="empty-block">세로 스크롤 영역</section>

    <HorizontalCaseSection items={caseItems} />

    <section className="empty-block">세로 스크롤 영역</section>
  </main>
</div>
```

---

## 데이터 기반 렌더링

카드 수와 내부 사진 수는 컴포넌트에 하드코딩하지 않고 배열 데이터로 관리합니다.

```ts
export const caseItems: CaseItem[] = [
  {
    id: 1,
    category: "Manufacturing",
    description: "...",
    photos: [
      {
        id: 101,
        title: "라인 스캔",
        accent: "...",
      },
    ],
  },
];
```

새로운 카드가 필요한 경우 `caseItems`에 데이터를 추가하면 동일한 컴포넌트 로직으로 렌더링됩니다.

각 카드 내부의 사진도 `photos` 배열을 기준으로 렌더링되므로 사진 개수를 변경하기 위해 컴포넌트 JSX를 수정할 필요가 없습니다.

---

## 섹션 / 카드 추가 방법

### 카드 추가

`src/fixtures/caseData.ts`의 `caseItems` 배열에 새로운 `CaseItem`을 추가합니다.

```ts
{
  id: 7,
  category: "Finance",
  description: "금융 데이터를 활용한 서비스 사례",
  photos: [
    {
      id: 701,
      title: "데이터 분석",
      accent: "linear-gradient(...)",
    },
  ],
}
```

### 카드 내부 사진 추가

해당 카드의 `photos` 배열에 `PhotoItem`을 추가합니다.

```ts
photos: [
  {
    id: 701,
    title: "데이터 분석",
    accent: "linear-gradient(...)",
  },
  {
    id: 702,
    title: "리포트",
    accent: "linear-gradient(...)",
  },
];
```

렌더링과 스크롤 거리 계산은 실제 DOM 크기를 기준으로 동작하기 때문에 카드 및 사진 개수가 변경되어도 동일한 구조를 사용할 수 있습니다.

---

## 실행 방법

Node.js 환경에서 프로젝트를 실행합니다.

```bash
npm install
npm run dev
```

프로덕션 빌드는 다음 명령으로 확인할 수 있습니다.

```bash
npm run build
```

코드 스타일 및 린트 검사는 다음 명령으로 실행할 수 있습니다.

```bash
npm run lint
```

---

## 기술스택/라이브러리 선택

### Vite

Vite는 빠른 개발 환경과 간단한 설정을 제공하기 때문에 선택했습니다.

이번 과제는 스크롤 인터랙션, 레이아웃, 반응형 동작을 반복적으로 확인하고 수정하는 과정이 중요하기 때문에 빠른 개발 서버와 HMR(Hot Module Replacement)을 지원하는 Vite가 적합하다고 판단했습니다.

또한 React + TypeScript 프로젝트를 간단하게 구성할 수 있어, 번들러 설정에 시간을 많이 들이지 않고 과제의 핵심인 UI와 스크롤 인터랙션 구현에 집중할 수 있었습니다.

### npm

패키지 매니저는 npm을 사용했습니다.

별도의 패키지 관리 환경을 구성하기보다, Node.js 설치 시 함께 제공되는 npm을 사용하여 프로젝트의 의존성을 단순하게 관리했습니다.

또한 `package-lock.json`을 통해 의존성 버전을 고정하여 다른 환경에서도 동일한 패키지 구성을 재현할 수 있도록 했습니다.

### React

카드와 섹션을 배열 기반으로 렌더링하고, UI 구조를 컴포넌트 단위로 관리하기 위해 React를 사용했습니다.

특히 카드 수가 변경되어도 동일한 UI 구조를 재사용할 수 있고, 데이터와 화면 렌더링을 분리하기에 적합하다고 판단했습니다.

### TypeScript

카드 데이터를 배열 기반으로 관리하기 때문에 CaseItem, PhotoItem 타입을 정의하여 데이터 구조를 명확하게 관리했습니다.

### 왜 GSAP를 사용했는가?

이 과제의 핵심은 단순한 요소의 이동이 아니라 스크롤 위치와 애니메이션을 지속적으로 동기화하는 것입니다.

GSAP ScrollTrigger는 다음과 같은 기능을 제공하기 때문에 적합하다고 판단했습니다.

- 스크롤 위치 기반 애니메이션
- 특정 위치를 기준으로 한 트리거
- section pin
- scrub
- refresh 시 레이아웃 재계산
- timeline을 통한 여러 애니메이션의 순차 제어

별도의 스크롤 이벤트에서 직접 `scrollTop`을 계산하고 `requestAnimationFrame`으로 transform을 관리하는 방식보다, 과제의 인터랙션을 명확하게 표현하고 관리할 수 있다고 판단했습니다.

### 왜 IntersectionObserver를 사용하지 않았는가?

IntersectionObserver는 요소의 진입/이탈 상태를 감지하는 데 적합하지만, 이 과제에서는 스크롤 진행률에 따라 연속적으로 가로 이동을 제어해야 합니다.

따라서 IntersectionObserver를 이용해 단순히 "섹션이 화면에 들어왔는지"를 감지하기보다는, 스크롤과 애니메이션을 함께 제어할 수 있는 GSAP ScrollTrigger를 선택했습니다.

---

## 아쉬운 점 / 개선 가능 사항

현재 구현은 주어진 과제의 핵심 인터랙션을 빠르게 구현하는 데 초점을 맞췄습니다.

시간이 더 주어진다면 다음 부분을 추가로 개선하고 싶습니다.

### 1. 중첩 가로 스크롤 UX 보완

현재 PC에서는 외부 `story-track`과 내부 `photo-track`의 이동을 하나의 GSAP timeline으로 순차 제어했습니다.

다만 실제 사용 환경에서는 마우스 휠, 트랙패드, 브라우저별 스크롤 입력 차이에 따라 체감 속도가 달라질 수 있기 때문에 다양한 입력 환경에서 추가적인 튜닝이 필요합니다.

### 2. 시각적 디테일 보완

이번 과제에서는 주어진 시간 내에 핵심 인터랙션과 반응형 동작을 우선적으로 구현하는 데 집중했습니다. 참고 영상과 비교했을 때 일부 시각적인 디테일과 콘텐츠 구성이 충분히 구현되지 않은 부분이 있습니다.

- 참고 영상에 포함된 실제 이미지와 유사한 콘텐츠를 적용하지 못하고 더미 콘텐츠로 대체했습니다.
- 카드 및 일부 UI의 세부적인 스타일과 간격을 충분히 다듬지 못했습니다.

시간이 더 주어진다면 참고 영상과 실제 구현 화면을 비교하면서 카드 크기, 간격, 타이포그래피 등의 세부적인 스타일을 보완하고, 실제 이미지와 콘텐츠를 적용하여 시각적인 완성도를 높이고 싶습니다.

## 배포 링크

https://lj05117.github.io/hellodigital/
