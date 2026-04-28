import { test, expect } from '@playwright/test'

test.describe('Power BI Lite Auth Flow', () => {
  test('should display landing page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Data insights' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Start for free' })).toBeVisible()
  })

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Start for free' }).click()
    await expect(page).toHaveURL('/signup')
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
  })

  test('should sign up a new user', async ({ page }) => {
    await page.goto('/signup')

    // Generate a unique email
    const testEmail = `test${Date.now()}@example.com`

    await page.getByLabel('Full name').fill('Test User')
    await page.getByLabel('Email').fill(testEmail)
    await page.getByLabel('Password').fill('password123')

    await page.getByRole('button', { name: 'Create account' }).click()

    // Wait for redirect to dashboard (may take a moment for Supabase)
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'Your workspace' })).toBeVisible()
  })

  test('should sign in existing user', async ({ page }) => {
    await page.goto('/login')

    // Use a pre-created user (you need to create this user manually first in Supabase)
    // For testing, you can use the same email from signup test if account persists
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')

    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
  })

  test('should show login link from signup page', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login')
  })
})
