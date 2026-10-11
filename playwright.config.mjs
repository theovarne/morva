import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  // Production is the optimized tardigrade console; retain later amoeba suites in Git.
  testMatch: ["tardigrade.spec.mjs", "brand.spec.mjs", "terminal.spec.mjs"],
  workers: 1,
  timeout: 30000,
  use: { baseURL: process.env.MILONO_TEST_URL || "http://127.0.0.1:4184", headless: true,
    viewport: { width: 1440, height: 1000 },
    launchOptions: { executablePath: process.env.MILONO_CHROME || undefined } },
  outputDir: "qa/test-results",
  reporter: "list",
  webServer: process.env.MILONO_TEST_URL ? undefined : {
    command: "node scripts/serve.mjs", env: { MILONO_PORT: "4184" },
    url: "http://127.0.0.1:4184", reuseExistingServer: true
  }
});
