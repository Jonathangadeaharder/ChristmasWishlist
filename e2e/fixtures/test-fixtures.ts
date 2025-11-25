import { test as base, expect } from '@playwright/test'

/**
 * Custom test fixtures for Christmas Wishlist E2E tests
 * Provides reusable page objects and helpers
 */

// Page Object Models
export class LoginPage {
  constructor(private page: import('@playwright/test').Page) {}

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.page.getByTestId('login-email-input').fill(email)
    await this.page.getByTestId('login-password-input').fill(password)
    await this.page.getByTestId('login-submit-button').click()
  }

  async expectError(message?: string) {
    const error = this.page.getByTestId('login-error')
    await expect(error).toBeVisible()
    if (message) {
      await expect(error).toContainText(message)
    }
  }

  async goToRegister() {
    await this.page.getByTestId('register-link').click()
  }
}

export class RegisterPage {
  constructor(private page: import('@playwright/test').Page) {}

  async goto() {
    await this.page.goto('/register')
  }

  async register(email: string, password: string) {
    await this.page.getByTestId('register-email-input').fill(email)
    await this.page.getByTestId('register-password-input').fill(password)
    await this.page.getByTestId('register-submit-button').click()
  }

  async expectError(message?: string) {
    const error = this.page.getByTestId('register-error')
    await expect(error).toBeVisible()
    if (message) {
      await expect(error).toContainText(message)
    }
  }

  async goToLogin() {
    await this.page.getByTestId('login-link').click()
  }
}

export class DashboardPage {
  constructor(private page: import('@playwright/test').Page) {}

  async expectVisible() {
    await expect(this.page.getByTestId('dashboard-page')).toBeVisible()
  }

  async expectUserEmail(email: string) {
    await expect(this.page.getByTestId('user-email')).toContainText(email)
  }

  async logout() {
    await this.page.getByTestId('logout-button').click()
  }

  async openAddItemForm() {
    await this.page.getByTestId('add-item-button').click()
  }

  async openAddFirstItemForm() {
    await this.page.getByTestId('add-first-item-button').click()
  }

  async expectEmptyWishlist() {
    await expect(this.page.getByTestId('empty-wishlist')).toBeVisible()
  }

  async getWishlistCount() {
    const text = await this.page.getByTestId('wishlist-count').textContent()
    const match = text?.match(/(\d+)/)
    return match ? parseInt(match[1], 10) : 0
  }
}

export class WishlistFormPage {
  constructor(private page: import('@playwright/test').Page) {}

  async expectVisible() {
    await expect(this.page.getByTestId('wishlist-form')).toBeVisible()
  }

  async fillForm(data: {
    title: string
    description?: string
    url?: string
    price?: string
    priority?: 'low' | 'medium' | 'high'
  }) {
    await this.page.getByTestId('wishlist-title-input').fill(data.title)

    if (data.description) {
      await this.page.getByTestId('wishlist-description-input').fill(data.description)
    }

    if (data.url) {
      await this.page.getByTestId('wishlist-url-input').fill(data.url)
    }

    if (data.price) {
      await this.page.getByTestId('wishlist-price-input').fill(data.price)
    }

    if (data.priority) {
      await this.page.getByTestId(`priority-${data.priority}`).click()
    }
  }

  async submit() {
    await this.page.getByTestId('wishlist-submit-button').click()
  }

  async cancel() {
    await this.page.getByTestId('wishlist-cancel-button').click()
  }
}

export class FriendListPage {
  constructor(private page: import('@playwright/test').Page) {}

  async expectVisible() {
    await expect(this.page.getByTestId('friend-list')).toBeVisible()
  }

  async searchFriend(email: string) {
    await this.page.getByTestId('friend-search-input').fill(email)
    await this.page.getByTestId('friend-search-button').click()
  }

  async expectNoFriendsMessage() {
    await expect(this.page.getByTestId('no-friends-message')).toBeVisible()
  }

  async expectSearchResults() {
    await expect(this.page.getByTestId('friend-search-results')).toBeVisible()
  }
}

// Extended test with fixtures
type Fixtures = {
  loginPage: LoginPage
  registerPage: RegisterPage
  dashboardPage: DashboardPage
  wishlistFormPage: WishlistFormPage
  friendListPage: FriendListPage
}

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page))
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page))
  },
  wishlistFormPage: async ({ page }, use) => {
    await use(new WishlistFormPage(page))
  },
  friendListPage: async ({ page }, use) => {
    await use(new FriendListPage(page))
  },
})

export { expect }
