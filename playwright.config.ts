import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests',
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:8080/electrification-intelligence-site/' },
  webServer: { command: 'node scripts/preview.mjs', url: 'http://127.0.0.1:8080/electrification-intelligence-site/', reuseExistingServer: !process.env.CI },
  projects: [
    {name:'desktop', use:{viewport:{width:1440,height:1000}}},
    {name:'mobile', use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}},
  ],
})
