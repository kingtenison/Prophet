# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: test-flow.spec.ts >> Full app flow
- Location: tests\test-flow.spec.ts:4:5

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/dashboard" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - generic [ref=e5]:
        - link "Power BI Lite" [ref=e7] [cursor=pointer]:
          - /url: /dashboard
          - img [ref=e8]
          - generic [ref=e10]: Power BI Lite
        - generic [ref=e11]:
          - link "Home" [ref=e12] [cursor=pointer]:
            - /url: /dashboard
            - img [ref=e13]
            - text: Home
          - link "Upload" [ref=e18] [cursor=pointer]:
            - /url: /datasets/upload
            - img [ref=e19]
            - text: Upload
          - link "Create Chart" [ref=e23] [cursor=pointer]:
            - /url: /charts/new
            - img [ref=e24]
            - text: Create Chart
        - generic [ref=e27]:
          - generic [ref=e29]: U
          - generic [ref=e30]:
            - paragraph [ref=e31]: Demo User
            - paragraph [ref=e32]: Free tier
          - button "Sign out" [ref=e33] [cursor=pointer]:
            - img [ref=e34]
    - main [ref=e37]:
      - generic [ref=e38]:
        - generic [ref=e39]:
          - heading "Upload dataset" [level=1] [ref=e40]
          - paragraph [ref=e41]: Upload a CSV or Excel file. Your file will be processed entirely in your browser.
        - generic [ref=e42] [cursor=pointer]:
          - button "Choose File" [ref=e43]
          - generic [ref=e44]:
            - img [ref=e46]
            - paragraph [ref=e49]: Drag & drop your data file
            - paragraph [ref=e50]: Supports CSV, XLS, XLSX (max 5.0 MB)
            - button "Browse Files" [ref=e51]:
              - img [ref=e52]
              - text: Browse Files
        - generic [ref=e55]:
          - generic [ref=e56]:
            - heading "Preview — sample_sales.csv" [level=2] [ref=e57]
            - generic [ref=e58]:
              - generic [ref=e59]: 8 rows × 5 columns
              - button "Confirm upload" [ref=e60] [cursor=pointer]:
                - img [ref=e61]
                - text: Confirm upload
          - table [ref=e66]:
            - rowgroup [ref=e67]:
              - row "DateA CategoryA Revenue# Profit# Units_Sold#" [ref=e68]:
                - columnheader "DateA" [ref=e69]
                - columnheader "CategoryA" [ref=e70]
                - columnheader "Revenue#" [ref=e71]
                - columnheader "Profit#" [ref=e72]
                - columnheader "Units_Sold#" [ref=e73]
            - rowgroup [ref=e74]:
              - row "2026-01-01 Electronics 5000 1200 50" [ref=e75]:
                - cell "2026-01-01" [ref=e76]
                - cell "Electronics" [ref=e77]
                - cell "5000" [ref=e78]
                - cell "1200" [ref=e79]
                - cell "50" [ref=e80]
              - row "2026-01-02 Electronics 6000 1500 60" [ref=e81]:
                - cell "2026-01-02" [ref=e82]
                - cell "Electronics" [ref=e83]
                - cell "6000" [ref=e84]
                - cell "1500" [ref=e85]
                - cell "60" [ref=e86]
              - row "2026-01-01 Clothing 3000 800 100" [ref=e87]:
                - cell "2026-01-01" [ref=e88]
                - cell "Clothing" [ref=e89]
                - cell "3000" [ref=e90]
                - cell "800" [ref=e91]
                - cell "100" [ref=e92]
              - row "2026-01-02 Clothing 3500 900 110" [ref=e93]:
                - cell "2026-01-02" [ref=e94]
                - cell "Clothing" [ref=e95]
                - cell "3500" [ref=e96]
                - cell "900" [ref=e97]
                - cell "110" [ref=e98]
              - row "2026-01-03 Electronics 4500 1000 45" [ref=e99]:
                - cell "2026-01-03" [ref=e100]
                - cell "Electronics" [ref=e101]
                - cell "4500" [ref=e102]
                - cell "1000" [ref=e103]
                - cell "45" [ref=e104]
              - row "2026-01-03 Clothing 4000 1100 130" [ref=e105]:
                - cell "2026-01-03" [ref=e106]
                - cell "Clothing" [ref=e107]
                - cell "4000" [ref=e108]
                - cell "1100" [ref=e109]
                - cell "130" [ref=e110]
              - row "2026-01-04 Home 7000 2000 70" [ref=e111]:
                - cell "2026-01-04" [ref=e112]
                - cell "Home" [ref=e113]
                - cell "7000" [ref=e114]
                - cell "2000" [ref=e115]
                - cell "70" [ref=e116]
              - row "2026-01-05 Home 6500 1800 65" [ref=e117]:
                - cell "2026-01-05" [ref=e118]
                - cell "Home" [ref=e119]
                - cell "6500" [ref=e120]
                - cell "1800" [ref=e121]
                - cell "65" [ref=e122]
          - generic [ref=e123]:
            - img [ref=e124]
            - paragraph [ref=e126]: Make sure your column names are clean. They will be used as field names in charts.
  - button "Open Next.js Dev Tools" [ref=e132] [cursor=pointer]:
    - img [ref=e133]
  - alert [ref=e136]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import path from 'path';
  3  | 
  4  | test('Full app flow', async ({ page }) => {
  5  |   console.log('Navigating to login');
  6  |   await page.goto('http://localhost:3000/login');
  7  |   
  8  |   console.log('Logging in');
  9  |   await page.fill('input[type="email"]', 'octetgamer10@gmail.com');
  10 |   await page.fill('input[type="password"]', 'hansen123');
  11 |   await page.click('button:has-text("Sign in")');
  12 |   
  13 |   console.log('Waiting for dashboard');
  14 |   await page.waitForURL('**/dashboard', { timeout: 10000 });
  15 |   
  16 |   console.log('Navigating to upload');
  17 |   await page.goto('http://localhost:3000/datasets/upload');
  18 |   
  19 |   console.log('Uploading file');
  20 |   const fileInput = await page.$('input[type="file"]');
  21 |   if (!fileInput) throw new Error('File input not found');
  22 |   await fileInput.setInputFiles(path.resolve(__dirname, '../sample_sales.csv'));
  23 |   
  24 |   console.log('Clicking upload dataset in modal');
  25 |   await page.waitForSelector('button:has-text("Upload dataset")');
  26 |   await page.click('button:has-text("Upload dataset")');
  27 |   
  28 |   try {
  29 |     console.log('Waiting for toast...');
  30 |     await page.waitForTimeout(2000);
  31 |     const toasts = await page.$$('.fixed.bottom-0.right-0 > div, [role="alert"]');
  32 |     for (const t of toasts) {
  33 |       console.log('Toast:', await t.innerText());
  34 |     }
  35 |   } catch(e) {}
  36 |   
  37 |   console.log('Waiting for upload to complete and redirect to dashboard');
> 38 |   await page.waitForURL('**/dashboard', { timeout: 15000 });
     |              ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  39 |   
  40 |   console.log('Navigating to chart builder');
  41 |   await page.goto('http://localhost:3000/charts/new');
  42 |   
  43 |   console.log('Configuring chart');
  44 |   // Wait for the select element to be visible
  45 |   await page.waitForSelector('select');
  46 |   const selects = await page.$$('select');
  47 |   
  48 |   // Choose the first dataset
  49 |   console.log('Selecting dataset');
  50 |   const datasetSelect = selects[0];
  51 |   await datasetSelect.selectOption({ index: 1 }); // first option is placeholder, second is dataset
  52 |   
  53 |   // Choose chart type
  54 |   console.log('Selecting chart type');
  55 |   await page.click('button:has-text("Bar")');
  56 |   
  57 |   // Select X and Y
  58 |   console.log('Selecting axes');
  59 |   const xSelect = selects[1];
  60 |   await xSelect.selectOption({ label: 'Category (text)' });
  61 |   
  62 |   const ySelect = selects[2];
  63 |   await ySelect.selectOption({ label: 'Revenue (number)' });
  64 |   
  65 |   // Wait for chart preview to render
  66 |   console.log('Waiting for chart preview');
  67 |   await page.waitForSelector('.recharts-responsive-container');
  68 |   
  69 |   console.log('Saving to dashboard');
  70 |   await page.click('button:has-text("Save to Dashboard")');
  71 |   
  72 |   await page.waitForURL('**/edit', { timeout: 10000 });
  73 |   console.log('Dashboard edit loaded successfully!');
  74 |   await page.waitForTimeout(2000);
  75 |   await page.screenshot({ path: 'test-results/final_dashboard.png', fullPage: true });
  76 | });
  77 | 
```