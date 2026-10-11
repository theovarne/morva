import { test, expect } from "@playwright/test";

async function command(page, text) {
  await page.locator("#terminal-input").fill(text);
  await page.locator("#terminal-input").press("Enter");
}

test("documented Terminal procedures match the active parser", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  const cases = [
    ["help", "inspect transition <n>"],
    ["status", "SIMULATION /"],
    ["inspect identity", "source local simulation"],
    ["inspect body", "PROTOCOL MODEL W = HKDF(sk)"],
    ["inspect weights", "weight root"],
    ["inspect metabolism", "reserve"],
    ["inspect history", "ACTIVE->ACTIVE"],
    ["inspect transition 1842", "#1842"],
    ["inspect transition 1", "not retained"],
    ["derive weights", "SIMULATED DERIVATION"],
    ["verify commitment", "LOCAL PASS / simulated"],
    ["inspect membrane", "unknown procedure"],
    ["inspect core", "unknown procedure"],
    ["inspect motility", "unknown procedure"],
    ["stress 2", "unknown procedure"],
    ["stress .72", "unknown procedure"]
  ];
  for (const [input, output] of cases) {
    await command(page, input);
    await expect(page.locator("#terminal-output .terminal-entry").last()).toContainText(output);
  }
  await command(page, "enter tun");
  const before = await page.evaluate(() => window.Milono.provider.getState());
  await command(page, "clear");
  await expect(page.locator("#terminal-output")).toBeEmpty();
  expect(await page.evaluate(() => window.Milono.provider.getState())).toEqual(before);
  expect(errors).toEqual([]);
});

test("documented stress-recovery sequence preserves identity and exact record schema", async ({ page }) => {
  await page.goto("/");
  const identity = await page.locator("#live-identity").innerText();
  await command(page, "stress 1");
  await expect(page.locator("#live-state")).toHaveText("TUN");
  await command(page, "wake");
  await expect(page.locator("#terminal-output .terminal-entry").last()).toContainText("wake denied");
  await command(page, "stress 0");
  await expect(page.locator("#live-state")).toHaveText("TUN");
  await command(page, "wake");
  await expect(page.locator("#live-state")).toHaveText("ACTIVE");
  await expect(page.locator("#live-identity")).toHaveText(identity);
  const record = await page.evaluate(() => window.Milono.provider.getState().history.at(-1));
  expect(Object.keys(record).sort()).toEqual(["action", "from", "hash", "number", "previous", "sensor", "timestamp", "to"]);
  expect(record.from).toBe("TUN");
  expect(record.to).toBe("ACTIVE");
});

test("fingerprint hover, keyboard and click share the Terminal inspection context", async ({ page }) => {
  await page.goto("/");
  const cell = page.locator('.weight-cell[data-index="20"]');
  await cell.hover();
  await expect(page.locator(".weight-index")).toHaveText("W[20]");
  await cell.click();
  await command(page, "inspect");
  await expect(page.locator("#terminal-output .terminal-entry").last()).toContainText("W[20]");
  await cell.focus();
  await cell.press("ArrowRight");
  const next = page.locator('.weight-cell[data-index="21"]');
  await expect(next).toBeFocused();
  await next.press("Enter");
  await command(page, "inspect");
  await expect(page.locator("#terminal-output .terminal-entry").last()).toContainText("W[21]");
});
