import type { CaseItem } from "../types/caseData";

export const caseItems: CaseItem[] = [
  {
    id: 1,
    category: "Manufacturing",
    description: "공장 라인과 설비 데이터를 연결해 운영 효율을 높이는 사례",
    photos: [
      { id: 101, title: "라인 스캔", accent: "linear-gradient(135deg, #7c93ff 0%, #b1c5ff 100%)" },
      { id: 102, title: "설비 상태", accent: "linear-gradient(135deg, #3a82ff 0%, #88d3ff 100%)" },
      { id: 103, title: "품질 체크", accent: "linear-gradient(135deg, #4f46e5 0%, #a7b6ff 100%)" },
    ],
  },
  {
    id: 2,
    category: "Healthcare",
    description: "진료와 환자 데이터를 한눈에 확인해 빠른 의사 결정을 지원하는 사례",
    photos: [
      {
        id: 201,
        title: "진료 대시보드",
        accent: "linear-gradient(135deg, #68d5c6 0%, #baf5ea 100%)",
      },
      {
        id: 202,
        title: "실시간 모니터링",
        accent: "linear-gradient(135deg, #1db9a7 0%, #82f5d2 100%)",
      },
      {
        id: 203,
        title: "환자 리포트",
        accent: "linear-gradient(135deg, #0ea5a5 0%, #9ce5d5 100%)",
      },
      { id: 204, title: "운영 분석", accent: "linear-gradient(135deg, #2dd4bf 0%, #c4fff1 100%)" },
    ],
  },
];
