import { test, expect } from "@playwright/test";

async function overlaps(page, width, height, shot) {
  await page.setViewportSize({ width, height });
  await page.goto(`/?shot=${shot}`, { waitUntil: "networkidle" });
  if (shot === "contested-built") {
    await page.locator("#btn-exit-site-overlay").click();
    await page.waitForTimeout(300);
  }
  return page.evaluate(() => window.__EMPIRE_SMOKE__.labelOverlaps());
}

for (const [width, height] of [
  [1280, 720],
  [1600, 900],
]) {
  test(`labels, claim tags, brackets, and crew chips stay apart at ${width}x${height}`, async ({ page }) => {
    const fresh = await overlaps(page, width, height, "map");
    expect(fresh, `opening map ${width}x${height}`).toEqual([]);
    const held = await overlaps(page, width, height, "contested-built");
    expect(held, `contested map ${width}x${height}`).toEqual([]);
  });
}
