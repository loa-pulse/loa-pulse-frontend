/** 로스트아크 아이템 등급. API는 한글 이름(예: "유물")으로 준다 */
export type GradeTone =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'relic'
  | 'ancient'
  | 'esther'

const toneByName: Record<string, GradeTone> = {
  일반: 'common',
  고급: 'uncommon',
  희귀: 'rare',
  영웅: 'epic',
  전설: 'legendary',
  유물: 'relic',
  고대: 'ancient',
  에스더: 'esther',
}

/** 모르는 등급은 일반으로 본다 (새 등급이 생겨도 화면이 깨지지 않게) */
export function gradeTone(grade: string): GradeTone {
  return toneByName[grade] ?? 'common'
}

/**
 * 등급별 썸네일 클래스. Tailwind가 찾을 수 있도록 클래스 이름을 문자열 그대로 둔다.
 * 연한 배경(15%)과 반투명 테두리(50%), 글자색
 */
export const gradeThumbClass: Record<GradeTone, string> = {
  common: 'border-grade-common/50 bg-grade-common/15 text-grade-common',
  uncommon: 'border-grade-uncommon/50 bg-grade-uncommon/15 text-grade-uncommon',
  rare: 'border-grade-rare/50 bg-grade-rare/15 text-grade-rare',
  epic: 'border-grade-epic/50 bg-grade-epic/15 text-grade-epic',
  legendary:
    'border-grade-legendary/50 bg-grade-legendary/15 text-grade-legendary',
  relic: 'border-grade-relic/50 bg-grade-relic/15 text-grade-relic',
  ancient: 'border-grade-ancient/50 bg-grade-ancient/15 text-grade-ancient',
  esther: 'border-grade-esther/50 bg-grade-esther/15 text-grade-esther',
}
