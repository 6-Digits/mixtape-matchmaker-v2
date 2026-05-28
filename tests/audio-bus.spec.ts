import { test, expect } from '@playwright/test';

// Verify only one audio source plays at a time. We can't make actual
// network preview fetches reliable in CI, so we stub Audio to capture
// play/pause/.src and assert claim/release semantics through the UI.

test('main player and editor preview do not overlap', async ({ page }) => {
  await page.addInitScript(() => {
    const events: Array<{ src: string; kind: 'play' | 'pause' }> = [];
    (window as unknown as { __audioEvents: typeof events }).__audioEvents = events;
    const RealAudio = window.Audio;
    function FakeAudio(src?: string) {
      const a = new RealAudio();
      Object.defineProperty(a, 'src', {
        get() { return (a as unknown as { _src: string })._src ?? ''; },
        set(v: string) { (a as unknown as { _src: string })._src = v; },
      });
      if (src) a.src = src;
      const origPlay = a.play.bind(a);
      const origPause = a.pause.bind(a);
      a.play = async () => {
        events.push({ src: a.src, kind: 'play' });
        // Fake duration so the bar enables controls
        Object.defineProperty(a, 'duration', { value: 30, configurable: true });
        a.dispatchEvent(new Event('loadedmetadata'));
        try { await origPlay(); } catch {/* no real audio */}
      };
      a.pause = () => {
        events.push({ src: a.src, kind: 'pause' });
        try { origPause(); } catch {/* ignore */}
      };
      return a;
    }
    (window as unknown as { Audio: typeof Audio }).Audio = FakeAudio as unknown as typeof Audio;
  });

  await page.goto('/login');
  await page.getByRole('button', { name: /Continue/i }).click();
  await page.waitForURL('**/');
  await page.goto('/playlists');

  // 1) Start main playback
  await page.getByRole('button', { name: /^Play$/ }).first().click();
  await expect(page.getByText(/Track \d+ of \d+/)).toBeVisible({ timeout: 5_000 });

  // 2) Open edit dialog and start a preview
  await page.getByRole('button', { name: /^Edit$/ }).first().click();
  // Tracklist editor renders song rows each with a Play preview IconButton aria-label like "Play preview".
  // Fall back to the first IconButton inside the dialog with an aria-label starting with "Play".
  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ state: 'visible' });
  const previewBtn = dialog.locator('button[aria-label^="Preview"]').first();
  await previewBtn.waitFor({ state: 'visible' });
  await previewBtn.click();

  await page.waitForTimeout(800);

  const events = await page.evaluate(() => (window as unknown as { __audioEvents: Array<{ src: string; kind: string }> }).__audioEvents);
  console.log('audio events:', events);

  // Expect: a play, then a pause, then another play. The bus must have
  // paused the first source before the second one started.
  expect(events.length).toBeGreaterThanOrEqual(3);
  const firstPlayIdx = events.findIndex((e) => e.kind === 'play');
  const firstPauseIdx = events.findIndex((e, i) => i > firstPlayIdx && e.kind === 'pause');
  const secondPlayIdx = events.findIndex((e, i) => i > firstPauseIdx && e.kind === 'play');
  expect(firstPlayIdx).toBeGreaterThanOrEqual(0);
  expect(firstPauseIdx).toBeGreaterThan(firstPlayIdx);
  expect(secondPlayIdx).toBeGreaterThan(firstPauseIdx);
});
