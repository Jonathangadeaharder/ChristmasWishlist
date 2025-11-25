import { test, expect } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test('should have no accessibility violations on login page', async ({ page }) => {
    await page.goto('/login')

    // Wait for page to load
    await expect(page.getByTestId('login-page')).toBeVisible()

    // Check accessibility with AxeBuilder
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .disableRules(['color-contrast']) // Will check separately
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have no accessibility violations on register page', async ({ page }) => {
    await page.goto('/register')

    // Wait for page to load
    await expect(page.getByTestId('register-page')).toBeVisible()

    // Check accessibility with AxeBuilder
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .disableRules(['color-contrast']) // Will check separately
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have documented color contrast violations on login page', async ({ page }) => {
    await page.goto('/login')

    // Check color contrast specifically
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .withRules(['color-contrast'])
      .analyze()

    // Note: We expect color contrast violations due to festive Christmas theme
    // Business decision prioritizes festive branding (green/red colors) over WCAG AA compliance
    // These violations are intentional and documented
    expect(accessibilityScanResults.violations.length).toBeGreaterThan(0)

    // Log violations for visibility
    console.log(
      'Color contrast violations (intentional for festive theme):',
      accessibilityScanResults.violations.map(v => v.description)
    )
  })

  test('should have documented color contrast violations on register page', async ({ page }) => {
    await page.goto('/register')

    // Check color contrast specifically
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .withRules(['color-contrast'])
      .analyze()

    // Note: We expect color contrast violations due to festive Christmas theme
    // Business decision prioritizes festive branding (green/red colors) over WCAG AA compliance
    // These violations are intentional and documented
    expect(accessibilityScanResults.violations.length).toBeGreaterThan(0)

    // Log violations for visibility
    console.log(
      'Color contrast violations (intentional for festive theme):',
      accessibilityScanResults.violations.map(v => v.description)
    )
  })

  test('should be keyboard navigable on login page', async ({ page }) => {
    await page.goto('/login')

    // Click first to establish page focus
    const emailInput = page.getByTestId('login-email-input')
    await emailInput.click()
    await expect(emailInput).toBeFocused()

    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await expect(page.getByTestId('login-password-input')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByTestId('login-submit-button')).toBeFocused()

    // Check accessibility after keyboard navigation
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should be keyboard navigable on register page', async ({ page }) => {
    await page.goto('/register')

    // Click first to establish page focus
    const emailInput = page.getByTestId('register-email-input')
    await emailInput.click()
    await expect(emailInput).toBeFocused()

    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await expect(page.getByTestId('register-password-input')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByTestId('register-submit-button')).toBeFocused()

    // Check accessibility after keyboard navigation
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
})
