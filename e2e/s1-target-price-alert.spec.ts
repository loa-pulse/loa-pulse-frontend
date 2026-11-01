import { expect, test } from '@playwright/test'

/**
 * S1 메인 시나리오 (03-screens-flows 흐름 1, 04-testing 5절).
 * 검색 → 상세 → 알림 설정 → 로그인 안내 → 로그인 → 상세로 돌아와 모달이 열림 → 등록 → 내 알림에 표시.
 * 목업 로그인은 디스코드 동의 화면 없이 바로 돌아온다.
 */
test('검색한 아이템에 목표가 알림을 걸고 내 알림에서 확인한다', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: '실시간 급등락' }),
  ).toBeVisible()

  // 헤더 검색 → 시세 목록
  const search = page.getByRole('searchbox', { name: '아이템 검색' })
  await search.fill('파괴석 결정')
  await search.press('Enter')
  await expect(page).toHaveURL(/\/items\?category=all&q=/)

  // 목록 → 상세
  await page.getByRole('link', { name: '운명의 파괴석 결정' }).click()
  await expect(
    page.getByRole('heading', { name: '운명의 파괴석 결정' }),
  ).toBeVisible()

  // 로그인하지 않았으므로 로그인 안내가 뜬다
  await page.getByRole('button', { name: '알림 설정' }).click()
  const login = page.getByRole('dialog')
  await expect(login).toContainText(
    '로그인하면 운명의 파괴석 결정 화면으로 돌아와 알림 설정이 열려요',
  )
  await login.getByRole('button', { name: '디스코드로 로그인' }).click()

  // 상세로 돌아와 모달이 열린 채로 시작한다
  const modal = page.getByRole('dialog', { name: '목표가 알림' })
  await expect(modal).toBeVisible()
  await expect(page).toHaveURL(/\/items\/66102007/)

  const threshold = modal.getByRole('textbox', { name: '기준가' })
  await threshold.fill('700')
  await modal.getByRole('button', { name: '알림 등록' }).click()

  await expect(page.getByText('알림을 등록했어요')).toBeVisible()
  await expect(
    page
      .getByRole('region', { name: '이 아이템 알림' })
      .getByText('700 G 이하'),
  ).toBeVisible()

  // 내 알림에서 활성으로 보인다
  await page
    .getByRole('navigation', { name: '주 메뉴' })
    .getByRole('link', { name: '내 알림' })
    .click()
  const registered = page.getByRole('region', { name: /등록한 알림/ })
  const row = registered.getByRole('listitem').filter({ hasText: '700 G 이하' })
  await expect(row).toContainText('운명의 파괴석 결정')
  await expect(row).toContainText('활성')
})
