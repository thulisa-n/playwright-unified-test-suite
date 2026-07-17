import { test, expect } from '../../fixtures/test-fixtures'
import { LoginPage } from '../../page-objects/LoginPage'

test.describe('Visual', () => {
  test('login page matches the visual baseline', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()

    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    })
  })

  test('inventory page matches the visual baseline', async ({ loggedInPage }) => {
    const page = loggedInPage.page

    await loggedInPage.addToCartByName('Sauce Labs Backpack')
    await loggedInPage.expectCartCount(1)

    await expect(page).toHaveScreenshot('inventory-page.png', {
      fullPage: true,
      mask: [loggedInPage.cartBadge],
      maxDiffPixelRatio: 0.01,
    })
  })
})
