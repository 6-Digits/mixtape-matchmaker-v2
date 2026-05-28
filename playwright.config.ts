import { defineConfig, devices } from '@playwright/test';

// Phone matrix — covers small/medium/large iOS + Android viewports so layout
// regressions are caught across the spectrum, not just one device.
const PHONES = [
  'iPhone SE',
  'iPhone 12 Mini',
  'iPhone XR',
  'iPhone 13',
  'iPhone 14 Pro Max',
  'iPhone 15 Pro Max',
  'Pixel 7',
  'Galaxy S9+',
] as const;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'off',
  },
  projects: PHONES.map((name) => ({
    name: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    use: {
      ...devices[name],
      // Run all phone profiles in Chromium so we don't need WebKit installed.
      browserName: 'chromium',
      channel: undefined,
    },
  })),
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
