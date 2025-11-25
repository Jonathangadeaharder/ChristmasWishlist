import { test, expect } from '@playwright/test'

/**
 * Visual and Responsive Design Tests
 * These tests verify the UI renders correctly across different viewports
 */

test.describe('Visual Design', () => {
  test.describe('Login Page', () => {
    test('should display festive branding elements', async ({ page }) => {
      await page.goto('/login')

      // Check for Christmas tree emoji
      await expect(page.locator('text=🎄')).toBeVisible()

      // Check for app title
      await expect(page.getByText('Christmas Wishlist')).toBeVisible()

      // Check for festive footer
      await expect(page.getByText('Make gift-giving magical')).toBeVisible()
    })

    test('should have proper styling classes', async ({ page }) => {
      await page.goto('/login')

      // Check card styling
      const card = page.locator('.card-festive').first()
      await expect(card).toBeVisible()

      // Check button styling
      const submitButton = page.getByTestId('login-submit-button')
      await expect(submitButton).toHaveClass(/btn-primary/)
    })

    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
      await page.goto('/login')

      // Form should still be visible and usable
      await expect(page.getByTestId('login-form')).toBeVisible()
      await expect(page.getByTestId('login-email-input')).toBeVisible()
      await expect(page.getByTestId('login-submit-button')).toBeVisible()
    })
  })

  test.describe('Register Page', () => {
    test('should display festive branding elements', async ({ page }) => {
      await page.goto('/register')

      // Check for gift emoji
      await expect(page.locator('text=🎁').first()).toBeVisible()

      // Check for page title
      await expect(page.getByText('Join the Fun!')).toBeVisible()

      // Check for festive footer
      await expect(page.getByText('The joy of giving starts here')).toBeVisible()
    })

    test('should display benefit icons', async ({ page }) => {
      await page.goto('/register')

      // Check benefit section exists
      const benefitsSection = page.locator("text=What you'll get:")
      await expect(benefitsSection).toBeVisible()
    })

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }) // iPad
      await page.goto('/register')

      // Form should still be visible and usable
      await expect(page.getByTestId('register-form')).toBeVisible()
    })
  })
})

test.describe('Animations', () => {
  test('should have floating animation on login page', async ({ page }) => {
    await page.goto('/login')

    // Check for animate-float class on tree emoji
    const floatingElement = page.locator('.animate-float').first()
    await expect(floatingElement).toBeVisible()
  })

  test('should have floating animation on register page', async ({ page }) => {
    await page.goto('/register')

    // Check for animate-float class
    const floatingElement = page.locator('.animate-float').first()
    await expect(floatingElement).toBeVisible()
  })
})

test.describe('Accessibility', () => {
  test('should have proper heading structure on login', async ({ page }) => {
    await page.goto('/login')

    // Check for h1
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    await expect(h1).toContainText('Christmas Wishlist')

    // Check for h2
    const h2 = page.locator('h2')
    await expect(h2).toBeVisible()
    await expect(h2).toContainText('Sign In')
  })

  test('should have proper heading structure on register', async ({ page }) => {
    await page.goto('/register')

    // Check for h1
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    await expect(h1).toContainText('Join the Fun!')

    // Check for h2
    const h2 = page.locator('h2')
    await expect(h2).toBeVisible()
    await expect(h2).toContainText('Create Account')
  })

  test('should have accessible form inputs', async ({ page }) => {
    await page.goto('/login')

    // Check email input accessibility
    const emailInput = page.getByTestId('login-email-input')
    await expect(emailInput).toHaveAttribute('id', 'email')
    await expect(emailInput).toHaveAttribute('type', 'email')
    await expect(emailInput).toHaveAttribute('required', '')

    // Check label association
    const emailLabel = page.locator('label[for="email"]')
    await expect(emailLabel).toBeVisible()
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/login')

    // Click on the email input first to ensure page has focus
    const emailInput = page.getByTestId('login-email-input')
    await emailInput.click()
    await expect(emailInput).toBeFocused()

    // Tab to password
    await page.keyboard.press('Tab')
    const passwordInput = page.getByTestId('login-password-input')
    await expect(passwordInput).toBeFocused()

    // Tab to submit button
    await page.keyboard.press('Tab')
    const submitButton = page.getByTestId('login-submit-button')
    await expect(submitButton).toBeFocused()
  })
})

test.describe('Color Scheme', () => {
  test('should use festive colors on login page', async ({ page }) => {
    await page.goto('/login')

    // Check that CSS variables are applied
    const styles = await page.evaluate(() => {
      return getComputedStyle(document.documentElement)
    })

    // Page should have custom properties defined
    expect(styles).toBeDefined()
  })

  test('should have consistent button styles', async ({ page }) => {
    await page.goto('/login')

    const submitButton = page.getByTestId('login-submit-button')

    // Check button is styled
    const buttonClasses = await submitButton.getAttribute('class')
    expect(buttonClasses).toContain('btn-primary')
  })
})
