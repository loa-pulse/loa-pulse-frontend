const HANGUL_START = 0xac00
const HANGUL_END = 0xd7a3

/** 마지막 글자에 받침이 있는지. 한글이 아니면 null */
function hasFinalConsonant(word: string): boolean | null {
  const code = word.trim().charCodeAt(word.trim().length - 1)
  if (Number.isNaN(code) || code < HANGUL_START || code > HANGUL_END) {
    return null
  }
  return (code - HANGUL_START) % 28 !== 0
}

/** 주격 조사를 붙인다. "파괴석" → "파괴석이", "수호강석 결정" → "수호강석 결정이", "모코코" → "모코코가" */
export function withSubjectParticle(word: string): string {
  const final = hasFinalConsonant(word)
  if (final === null) return `${word}이(가)`
  return `${word}${final ? '이' : '가'}`
}
