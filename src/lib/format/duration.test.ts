import { describe, expect, it } from 'vitest'
import { formatMinutes, formatSeconds } from './duration'

describe('formatSeconds', () => {
  it.each([
    [0, '0초'],
    [24, '24초'],
    [59.6, '1분'],
    [60, '1분'],
    [160, '2분 40초'],
    [null, '–'],
  ])('%s → %s', (seconds, expected) => {
    expect(formatSeconds(seconds)).toBe(expected)
  })
})

describe('formatMinutes', () => {
  it.each([
    [2, '2분'],
    [60, '1시간'],
    [90, '1시간 30분'],
    [360, '6시간'],
  ])('%s → %s', (minutes, expected) => {
    expect(formatMinutes(minutes)).toBe(expected)
  })
})
