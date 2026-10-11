import { expect, test } from "@playwright/test";

test("DC footprint follows page.mouse.move across the pad", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/?shot=empty");
  const dc = page.locator('[data-kit="dc"]');
  await dc.hover();
  const box = await page.locator("#site-stack").boundingBox();
  expect(box).toBeTruthy();
  const left = { x: box.x + box.width * 0.22, y: box.y + box.height * 0.55 };
  const right = { x: box.x + box.width * 0.78, y: box.y + box.height * 0.42 };
  await page.mouse.move(left.x, left.y, { steps: 15 });
  const slotL = await page.locator("#site-yard .site-footprint").getAttribute("data-slot");
  const cellL = await page.locator("#site-yard .site-footprint").getAttribute("data-cell");
  await page.mouse.move(right.x, right.y, { steps: 15 });
  const slotR = await page.locator("#site-yard .site-footprint").getAttribute("data-slot");
  const cellR = await page.locator("#site-yard .site-footprint").getAttribute("data-cell");
  expect(slotL).toBeTruthy();
  expect(slotR).toBeTruthy();
  expect(slotL).not.toBe(slotR);
  expect(cellL).not.toBe(cellR);
});

test("smoke ghostSlot changes between the far-left and far-right cells", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/?shot=empty");
  await page.locator('[data-kit="dc"]').hover();
  const leftBox = await page.locator('#site-yard [data-cell="0,1"]').boundingBox();
  const rightBox = await page.locator('#site-yard [data-cell="4,1"]').boundingBox();
  expect(leftBox).toBeTruthy();
  expect(rightBox).toBeTruthy();
  await page.mouse.move(leftBox.x + leftBox.width / 2, leftBox.y + leftBox.height / 2, { steps: 18 });
  const left = await page.evaluate(() => window.__EMPIRE_SMOKE__.ghostSlot());
  await page.mouse.move(rightBox.x + rightBox.width / 2, rightBox.y + rightBox.height / 2, { steps: 24 });
  const right = await page.evaluate(() => window.__EMPIRE_SMOKE__.ghostSlot());
  expect(left).toBeTruthy();
  expect(right).toBeTruthy();
  expect(left.slot).not.toBe(right.slot);
});
