import { test, expect } from '@playwright/test'
import { LoginPage } from '../../page-objects/LoginPage'
import { InventoryPage } from '../../page-objects/InventoryPage'
import { USERS, PASSWORD } from '../../data/users'

test.describe('Visual', () => {
  let login: LoginPage
  let inventory: InventoryPage

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page)
    inventory = new InventoryPage(page)
    await login.goto()
  })

  // 1
  test('login page matches the visual baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    })
  })

  // 2
  test('inventory page matches the visual baseline', async ({ page }) => {
    await login.login(USERS.standard, PASSWORD)
    await inventory.expectLoaded()

    // Keep a visible dynamic element and mask it to avoid false diffs.
    await inventory.addToCartByName('Sauce Labs Backpack')
    await inventory.expectCartCount(1)

    await expect(page).toHaveScreenshot('inventory-page.png', {
      fullPage: true,
      mask: [inventory.cartBadge],
      maxDiffPixelRatio: 0.01,
    })
  })
})
