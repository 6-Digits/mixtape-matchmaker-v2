import { test, expect } from '@playwright/test';

test('sticky NowPlayingBar pinned to bottom of viewport after pressing Play', async ({ page }, testInfo) => {
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log(`[browser error]`, msg.text());
  });

  await page.goto('/login');
  await page.getByRole('button', { name: /Continue/i }).click();
  await page.waitForURL('**/');

  await page.goto('/playlists');
  const playButton = page.getByRole('button', { name: /^Play$/ }).first();
  await playButton.waitFor({ state: 'visible' });
  await playButton.click();

  const bar = page.getByTestId('now-playing-bar');
  await expect(bar).toBeVisible({ timeout: 5_000 });

  // Settle layout (slider row may add height after duration loads).
  await page.waitForTimeout(400);

  await page.screenshot({ path: `test-results/${testInfo.project.name}-playing.png`, fullPage: false });

  const viewport = page.viewportSize();
  const box = await bar.boundingBox();
  console.log(`[${testInfo.project.name}] viewport=`, viewport, 'bar=', box);
  expect(viewport).not.toBeNull();
  expect(box).not.toBeNull();
  if (!viewport || !box) return;

  // The bar must end exactly at the viewport bottom (small float tolerance).
  expect(box.y + box.height).toBeGreaterThan(viewport.height - 2);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 2);
  // And it must not be wider than the viewport.
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
});
