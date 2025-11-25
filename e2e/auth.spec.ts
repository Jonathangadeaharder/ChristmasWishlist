import { test, expect } from './fixtures/test-fixtures'

test.describe('Authentication Flow', () => {
  test.describe('Login Page', () => {
    test('should display login page with all elements', async ({ page, loginPage }) => {
      await loginPage.goto()

      // Check page is visible
      await expect(page.getByTestId('login-page')).toBeVisible()

      // Check form elements
      await expect(page.getByTestId('login-form')).toBeVisible()
      await expect(page.getByTestId('login-email-input')).toBeVisible()
      await expect(page.getByTestId('login-password-input')).toBeVisible()
      await expect(page.getByTestId('login-submit-button')).toBeVisible()
      await expect(page.getByTestId('register-link')).toBeVisible()

      // Check page content
      await expect(page.getByText('Christmas Wishlist')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
    })

    test('should show validation for empty fields', async ({ page, loginPage }) => {
      await loginPage.goto()

      // Try to submit empty form
      await page.getByTestId('login-submit-button').click()

      // Email input should be invalid (HTML5 validation)
      const emailInput = page.getByTestId('login-email-input')
      await expect(emailInput).toHaveAttribute('required', '')
    })

    test('should show error for invalid credentials', async ({ page, loginPage }) => {
      await loginPage.goto()

      await loginPage.login('invalid@example.com', 'wrongpassword')

      // Wait for error to appear (Firebase will return an error)
      await expect(page.getByTestId('login-error')).toBeVisible({ timeout: 10000 })
    })

    test('should navigate to register page', async ({ page, loginPage }) => {
      await loginPage.goto()
      await loginPage.goToRegister()

      await expect(page.getByTestId('register-page')).toBeVisible()
    })

    test('should have proper input types', async ({ page, loginPage }) => {
      await loginPage.goto()

      await expect(page.getByTestId('login-email-input')).toHaveAttribute('type', 'email')
      await expect(page.getByTestId('login-password-input')).toHaveAttribute('type', 'password')
    })
  })

  test.describe('Register Page', () => {
    test('should display register page with all elements', async ({ page, registerPage }) => {
      await registerPage.goto()

      // Check page is visible
      await expect(page.getByTestId('register-page')).toBeVisible()

      // Check form elements
      await expect(page.getByTestId('register-form')).toBeVisible()
      await expect(page.getByTestId('register-email-input')).toBeVisible()
      await expect(page.getByTestId('register-password-input')).toBeVisible()
      await expect(page.getByTestId('register-submit-button')).toBeVisible()
      await expect(page.getByTestId('login-link')).toBeVisible()

      // Check page content
      await expect(page.getByText('Join the Fun!')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
    })

    test('should have password minimum length requirement', async ({ page, registerPage }) => {
      await registerPage.goto()

      const passwordInput = page.getByTestId('register-password-input')
      await expect(passwordInput).toHaveAttribute('minlength', '6')
    })

    test('should navigate to login page', async ({ page, registerPage }) => {
      await registerPage.goto()
      await registerPage.goToLogin()

      await expect(page.getByTestId('login-page')).toBeVisible()
    })

    test('should show error for weak password', async ({ page, registerPage }) => {
      await registerPage.goto()

      // Try to register with a weak password
      await registerPage.register('test@example.com', '123')

      // Browser validation should prevent submission (minlength=6)
      const passwordInput = page.getByTestId('register-password-input')
      const validityState = await passwordInput.evaluate(
        (el: HTMLInputElement) => el.validity.tooShort
      )
      expect(validityState).toBe(true)
    })
  })

  test.describe('Navigation', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Try to access dashboard directly
      await page.goto('/')

      // Should be redirected to login
      await expect(page.getByTestId('login-page')).toBeVisible()
    })

    test('should handle unknown routes', async ({ page }) => {
      await page.goto('/unknown-page')

      // Should redirect to login (since not authenticated) or home
      await expect(page.getByTestId('login-page')).toBeVisible()
    })
  })
})
