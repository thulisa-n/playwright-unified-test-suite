import { test, expect } from '@playwright/test'
import { LoginPage } from '../../page-objects/LoginPage'
import { InventoryPage } from '../../page-objects/InventoryPage'
import { ProductDetailPage } from '../../page-objects/ProductDetailPage'
import { USERS, PASSWORD } from '../../data/users'

test.describe('Products', () => {
  let inventory: InventoryPage

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await login.login(USERS.standard, PASSWORD)
    inventory = new InventoryPage(page)
    await inventory.expectLoaded()
  })

  // 1
  test('inventory page shows the Products title', async () => {
    await expect(inventory.title).toBeVisible()
  })

  // 2
  test('exactly 6 products are listed', async () => {
    await expect(inventory.items).toHaveCount(6)
  })

  // 3
  test('every product has a visible name', async ({ page }) => {
    const names = page.getByTestId('inventory-item-name')
    await expect(names).toHaveCount(6)
    const count = await names.count()
    for (let i = 0; i < count; i++) {
      await expect(names.nth(i)).toBeVisible()
    }
  })

  // 4
  test('every product has a visible price', async ({ page }) => {
    const prices = page.getByTestId('inventory-item-price')
    await expect(prices).toHaveCount(6)
    const count = await prices.count()
    for (let i = 0; i < count; i++) {
      await expect(prices.nth(i)).toBeVisible()
    }
  })

  // 5
  test('every product has an Add to cart button', async () => {
    const count = await inventory.items.count()
    for (let i = 0; i < count; i++) {
      await expect(
        inventory.items.nth(i).getByRole('button', { name: /add to cart/i }),
      ).toBeVisible()
    }
  })

  // 6
  test('sort by Name A to Z orders names ascending', async () => {
    await inventory.sortBy('az')
    const names = await inventory.productNames()
    const sorted = [...names].sort((a, b) => a.localeCompare(b))
    expect(names).toEqual(sorted)
  })

  // 7
  test('sort by Name Z to A orders names descending', async () => {
    await inventory.sortBy('za')
    const names = await inventory.productNames()
    const sorted = [...names].sort((a, b) => b.localeCompare(a))
    expect(names).toEqual(sorted)
  })

  // 8
  test('sort by Price low to high orders prices ascending', async () => {
    await inventory.sortBy('lohi')
    const prices = await inventory.productPrices()
    const sorted = [...prices].sort((a, b) => a - b)
    expect(prices).toEqual(sorted)
  })

  // 9
  test('sort by Price high to low orders prices descending', async () => {
    await inventory.sortBy('hilo')
    const prices = await inventory.productPrices()
    const sorted = [...prices].sort((a, b) => b - a)
    expect(prices).toEqual(sorted)
  })

  // 10
  test('add Sauce Labs Backpack updates cart badge to 1', async () => {
    await inventory.addToCartByName('Sauce Labs Backpack')
    await inventory.expectCartCount(1)
  })

  // 11
  test('add two products updates cart badge to 2', async () => {
    await inventory.addToCartByName('Sauce Labs Backpack')
    await inventory.addToCartByName('Sauce Labs Bike Light')
    await inventory.expectCartCount(2)
  })

  // 12
  test('add then the button becomes Remove', async () => {
    await inventory.addToCartByName('Sauce Labs Backpack')
    const item = inventory.items.filter({ hasText: 'Sauce Labs Backpack' })
    await expect(item.getByRole('button', { name: /remove/i })).toBeVisible()
  })

  // 13
  test('remove a product updates the badge back to empty', async () => {
    await inventory.addToCartByName('Sauce Labs Backpack')
    await inventory.expectCartCount(1)
    await inventory.removeFromCartByName('Sauce Labs Backpack')
    await inventory.expectCartCount(0)
  })

  // 14
  test('add all six products shows badge 6', async () => {
    const names = await inventory.productNames()
    for (const name of names) {
      await inventory.addToCartByName(name)
    }
    await inventory.expectCartCount(6)
  })

  // 15
  test('cart link navigates to the cart page', async ({ page }) => {
    await inventory.cartLink.click()
    await expect(page).toHaveURL(/cart\.html/)
  })

  // 16
  test('open a product opens its detail page', async ({ page }) => {
    await inventory.openProductByName('Sauce Labs Backpack')
    await expect(page).toHaveURL(/inventory-item\.html/)
  })

  // 17
  test('product detail shows the correct name', async () => {
    await inventory.openProductByName('Sauce Labs Backpack')
    const detail = new ProductDetailPage(inventory.page)
    await detail.expectName('Sauce Labs Backpack')
  })

  // 18
  test('product detail shows a price', async () => {
    await inventory.openProductByName('Sauce Labs Backpack')
    const detail = new ProductDetailPage(inventory.page)
    await expect(detail.price).toBeVisible()
    await expect(detail.price).toHaveText(/\$\d+\.\d{2}/)
  })

  // 19
  test('back button returns to the inventory page', async ({ page }) => {
    await inventory.openProductByName('Sauce Labs Backpack')
    const detail = new ProductDetailPage(page)
    await detail.goBack()
    await expect(page).toHaveURL(/inventory\.html/)
    await expect(inventory.title).toBeVisible()
  })

  // 20
  test('add to cart from the detail page updates the badge', async ({ page }) => {
    await inventory.openProductByName('Sauce Labs Backpack')
    const detail = new ProductDetailPage(page)
    await detail.addToCart()
    await expect(inventory.cartBadge).toHaveText('1')
  })

  // 21
  test('cart badge persists from inventory to detail page', async ({ page }) => {
    await inventory.addToCartByName('Sauce Labs Backpack')
    await inventory.expectCartCount(1)
    await inventory.openProductByName('Sauce Labs Backpack')
    await expect(page).toHaveURL(/inventory-item\.html/)
    await expect(inventory.cartBadge).toHaveText('1')
  })

  // 22
  test('open menu shows the All Items, About, Logout, Reset links', async ({ page }) => {
    await inventory.openMenu()
    await expect(page.getByTestId('inventory-sidebar-link')).toBeVisible()
    await expect(page.getByTestId('about-sidebar-link')).toBeVisible()
    await expect(page.getByTestId('logout-sidebar-link')).toBeVisible()
    await expect(page.getByTestId('reset-sidebar-link')).toBeVisible()
  })

  // 23
  test('reset app state clears the cart badge after adding an item', async () => {
    await inventory.addToCartByName('Sauce Labs Backpack')
    await inventory.expectCartCount(1)
    await inventory.resetAppState()
    await inventory.expectCartCount(0)
  })

  // 24
  test('footer shows the Sauce Labs copyright and three social links', async ({ page }) => {
    await expect(page.getByTestId('footer-copy')).toContainText('Sauce Labs')
    await expect(page.getByTestId('social-twitter')).toBeVisible()
    await expect(page.getByTestId('social-facebook')).toBeVisible()
    await expect(page.getByTestId('social-linkedin')).toBeVisible()
  })
})
