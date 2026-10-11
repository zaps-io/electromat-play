import { expect, test } from "@playwright/test";

test("a crew builds a DC row, traffic pays, and the age advances", async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/");
  await page.waitForFunction(() => window.__EMPIRE_SMOKE__?.ready);
  await page.waitForTimeout(400);

  const crew = await page.evaluate(() => window.__EMPIRE_SMOKE__.crewScreen());
  await page.mouse.click(crew.x, crew.y);
  await expect(page.locator("#select-name")).toHaveText(/Crew/);

  await page.keyboard.press("w");
  const pad = await page.evaluate(() => window.__EMPIRE_SMOKE__.padScreen());
  await page.mouse.click(pad.x, pad.y);
  const raising = await page.evaluate(() =>
    window.__EMPIRE_SMOKE__.buildings().some((b) => b.kind === "dc" && b.faction === 1 && b.progress < 1)
  );
  expect(raising).toBe(true);

  await page.evaluate(() => window.__EMPIRE_SMOKE__.fast(24));
  const done = await page.evaluate(() =>
    window.__EMPIRE_SMOKE__.buildings().some((b) => b.kind === "dc" && b.faction === 1 && b.done)
  );
  expect(done).toBe(true);

  await page.evaluate(() => window.__EMPIRE_SMOKE__.fast(18));
  expect(await page.evaluate(() => window.__EMPIRE_SMOKE__.paid())).toBeGreaterThan(0);
  await expect(page.locator(".float").first()).toBeVisible();

  const before = await page.evaluate(() => window.__EMPIRE_SMOKE__.resources());
  await page.evaluate(() => window.__EMPIRE_SMOKE__.fast(60));
  const after = await page.evaluate(() => window.__EMPIRE_SMOKE__.resources());
  expect(after.capital).toBeGreaterThan(before.capital);
  expect(after.permits).toBeGreaterThan(before.permits);
  expect(after.copper).toBeGreaterThan(before.copper);
  expect(after.steel).toBeGreaterThan(before.steel);

  const prep = await page.evaluate(() => window.__EMPIRE_SMOKE__.prepFleet());
  expect(prep.dc).toBeGreaterThanOrEqual(4);
  expect(prep.warehouse).toBe(true);
  expect(prep.gate).toBe("");
  await expect(page.locator("#btn-age")).toBeEnabled();
  await page.click("#btn-age");
  await page.evaluate(() => window.__EMPIRE_SMOKE__.fast(62));
  await expect(page.locator("#age-name")).toHaveText("FLEET AGE");
  await expect(page.locator("#age-banner")).toBeVisible();
  await expect(page.locator("#age-banner")).toHaveText("FLEET AGE");
});
