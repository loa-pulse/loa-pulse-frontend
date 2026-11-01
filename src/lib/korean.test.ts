import { describe, expect, it } from 'vitest'
import { withSubjectParticle } from './korean'

describe('withSubjectParticle', () => {
  it.each([
    ['운명의 파괴석', '운명의 파괴석이'],
    ['유물 원한 각인서', '유물 원한 각인서가'],
    ['빙하의 숨결', '빙하의 숨결이'],
    ['정제된 수호강석', '정제된 수호강석이'],
    ['ABC', 'ABC이(가)'],
  ])('%s → %s', (word, expected) => {
    expect(withSubjectParticle(word)).toBe(expected)
  })
})
