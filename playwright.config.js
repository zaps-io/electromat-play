import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:8080",
    channel: "chrome",
    viewport: { width: 1600, height: 900 },
  },
  webServer: {
    command: "python3 -m http.server 8080 --bind 127.0.0.1",
    port: 8080,
    reuseExistingServer: true,
  },
});
