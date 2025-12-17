const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:8087/Proyecto_Final/',
    
    headless: false, 
    
    launchOptions: {
      slowMo: 1000, 
    },
    
    actionTimeout: 30000, 
    navigationTimeout: 30000, 
    

    viewport: { width: 1280, height: 720 },
    
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on', 
  },

  projects: [
    {
      name: 'chrome',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      },
    },
  ],
});