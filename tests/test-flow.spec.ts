import { test, expect } from '@playwright/test';
import path from 'path';

test('Full app flow', async ({ page }) => {
  console.log('Navigating to login');
  await page.goto('http://localhost:3000/login');
  
  console.log('Logging in');
  await page.fill('input[type="email"]', 'octetgamer10@gmail.com');
  await page.fill('input[type="password"]', 'hansen123');
  await page.click('button:has-text("Sign in")');
  
  console.log('Waiting for dashboard');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  console.log('Navigating to upload');
  await page.goto('http://localhost:3000/datasets/upload');
  
  console.log('Uploading file');
  const fileInput = await page.$('input[type="file"]');
  if (!fileInput) throw new Error('File input not found');
  await fileInput.setInputFiles(path.resolve(__dirname, '../sample_sales.csv'));
  
  console.log('Clicking upload dataset in modal');
  await page.waitForSelector('button:has-text("Upload dataset")');
  await page.click('button:has-text("Upload dataset")');
  
  try {
    console.log('Waiting for toast...');
    await page.waitForTimeout(2000);
    const toasts = await page.$$('.fixed.bottom-0.right-0 > div, [role="alert"]');
    for (const t of toasts) {
      console.log('Toast:', await t.innerText());
    }
  } catch(e) {}
  
  console.log('Waiting for upload to complete and redirect to dashboard');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  
  console.log('Navigating to chart builder');
  await page.goto('http://localhost:3000/charts/new');
  
  console.log('Configuring chart');
  // Wait for the select element to be visible
  await page.waitForSelector('select');
  const selects = await page.$$('select');
  
  // Choose the first dataset
  console.log('Selecting dataset');
  const datasetSelect = selects[0];
  await datasetSelect.selectOption({ index: 1 }); // first option is placeholder, second is dataset
  
  // Choose chart type
  console.log('Selecting chart type');
  await page.click('button:has-text("Bar")');
  
  // Select X and Y
  console.log('Selecting axes');
  const xSelect = selects[1];
  await xSelect.selectOption({ label: 'Category (text)' });
  
  const ySelect = selects[2];
  await ySelect.selectOption({ label: 'Revenue (number)' });
  
  // Wait for chart preview to render
  console.log('Waiting for chart preview');
  await page.waitForSelector('.recharts-responsive-container');
  
  console.log('Saving to dashboard');
  await page.click('button:has-text("Save to Dashboard")');
  
  await page.waitForURL('**/edit', { timeout: 10000 });
  console.log('Dashboard edit loaded successfully!');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/final_dashboard.png', fullPage: true });
});
