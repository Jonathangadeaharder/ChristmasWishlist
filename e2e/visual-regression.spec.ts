import { test, expect } from '@playwright/test'
import percySnapshot from '@percy/playwright'

/**
 * Visual Regression Tests with Percy
 *
 * These tests capture screenshots of key pages and components,
 * comparing them against baselines to catch visual bugs like:
 * - CSS specificity issues (icon/text overlap)
 * - Layout regressions
 * - Styling inconsistencies
 * - Responsive design breaks
 *
 * Run with: npx percy exec -- npx playwright test e2e/visual-regression.spec.ts
 */

test.describe('Visual Regression - Login Page', () => {
  test('login page desktop view', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByTestId('login-page')).toBeVisible()

    // Wait for any animations to complete
    await page.waitForTimeout(500)

    // Capture Percy snapshot
    await percySnapshot(page, 'Login Page - Desktop')
  })

  test('login page with form inputs focused', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByTestId('login-page')).toBeVisible()

    // Fill in some text to test input styling with content
    await page.getByTestId('login-email-input').fill('test@example.com')
    await page.getByTestId('login-password-input').fill('password123')

    await percySnapshot(page, 'Login Page - With Input Values')
  })

  test('login page with validation error', async ({ page }) => {
    await page.goto('/login')

    // Fill with invalid credentials to trigger error
    await page.getByTestId('login-email-input').fill('invalid@test.com')
    await page.getByTestId('login-password-input').fill('wrongpass')
    await page.getByTestId('login-submit-button').click()

    // Wait for error message (Firebase auth will fail)
    await page.waitForSelector('[data-testid="login-error"]', { timeout: 10000 }).catch(() => {})

    await percySnapshot(page, 'Login Page - With Error')
  })

  test('login page mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await page.goto('/login')
    await expect(page.getByTestId('login-page')).toBeVisible()

    await percySnapshot(page, 'Login Page - Mobile')
  })

  test('login page tablet view', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }) // iPad
    await page.goto('/login')
    await expect(page.getByTestId('login-page')).toBeVisible()

    await percySnapshot(page, 'Login Page - Tablet')
  })
})

test.describe('Visual Regression - Register Page', () => {
  test('register page desktop view', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByTestId('register-page')).toBeVisible()

    await page.waitForTimeout(500)

    await percySnapshot(page, 'Register Page - Desktop')
  })

  test('register page with form inputs', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByTestId('register-page')).toBeVisible()

    // Fill in form to test input styling
    await page.getByTestId('register-email-input').fill('newuser@example.com')
    await page.getByTestId('register-password-input').fill('securepass123')

    await percySnapshot(page, 'Register Page - With Input Values')
  })

  test('register page mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/register')
    await expect(page.getByTestId('register-page')).toBeVisible()

    await percySnapshot(page, 'Register Page - Mobile')
  })
})

test.describe('Visual Regression - Input Components', () => {
  test('input fields with icons should have proper spacing', async ({ page }) => {
    await page.goto('/login')

    // This test specifically catches the icon overlap bug
    const emailInput = page.getByTestId('login-email-input')
    const passwordInput = page.getByTestId('login-password-input')

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()

    // Fill inputs to verify text doesn't overlap with icons
    await emailInput.fill('verylongemail@exampledomain.com')
    await passwordInput.fill('••••••••••••')

    // Take focused snapshot of just the form area
    await percySnapshot(page, 'Input Fields - With Icons and Text', {
      scope: '[data-testid="login-form"]',
    })
  })

  test('input fields focus states', async ({ page }) => {
    await page.goto('/login')

    const emailInput = page.getByTestId('login-email-input')
    await emailInput.click()

    // Capture focus state
    await percySnapshot(page, 'Input Fields - Focus State')
  })
})

test.describe('Visual Regression - Buttons', () => {
  test('button states on login page', async ({ page }) => {
    await page.goto('/login')

    // Default state
    await percySnapshot(page, 'Login Button - Default State')

    // Hover state (move mouse to button)
    const submitButton = page.getByTestId('login-submit-button')
    await submitButton.hover()

    await percySnapshot(page, 'Login Button - Hover State')
  })

  test('button loading state', async ({ page }) => {
    await page.goto('/login')

    // Fill form and submit to trigger loading state
    await page.getByTestId('login-email-input').fill('test@example.com')
    await page.getByTestId('login-password-input').fill('password123')

    // Click and immediately capture (loading state is brief)
    await page.getByTestId('login-submit-button').click()

    // Try to capture loading state
    await percySnapshot(page, 'Login Button - Loading State')
  })
})

test.describe('Visual Regression - Responsive Breakpoints', () => {
  const breakpoints = [
    { name: 'Mobile S', width: 320, height: 568 },
    { name: 'Mobile M', width: 375, height: 667 },
    { name: 'Mobile L', width: 425, height: 812 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Laptop', width: 1024, height: 768 },
    { name: 'Desktop', width: 1440, height: 900 },
  ]

  for (const bp of breakpoints) {
    test(`login page at ${bp.name} (${bp.width}x${bp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height })
      await page.goto('/login')
      await expect(page.getByTestId('login-page')).toBeVisible()

      await percySnapshot(page, `Login Page - ${bp.name}`)
    })
  }
})

test.describe('Visual Regression - Animations Complete', () => {
  test('page after animations settle', async ({ page }) => {
    await page.goto('/login')

    // Wait for CSS animations to complete (float animation is 3s)
    await page.waitForTimeout(3500)

    await percySnapshot(page, 'Login Page - Animations Settled')
  })
})
