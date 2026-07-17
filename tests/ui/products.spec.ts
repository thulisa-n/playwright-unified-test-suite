import { test, expect } from '../../fixtures/test-fixtures'
import { ProductDetailPage } from '../../page-objects/ProductDetailPage'

test.describe('Products', () => {
  // 1
  test('inventory page shows the Products title', async ({ loggedInPage }) => {
    await expect(loggedInPage.title).toBeVisible()
  })

  // 2
  test('exactly 6 products are listed', async ({ loggedInPage }) => {
    await expect(loggedInPage.items).toHaveCount(6)
  })

  // 3
  test('every product has a visible name', async ({ loggedInPage }) => {
    const page = loggedInPage.page
    const names = page.getByTestId('inventory-item-name')
    await expect(names).toHaveCount(6)
    const count = await names.count()
    for (let i = 0; i < count; i++) {
      await expect(names.nth(i)).toBeVisible()
    }
  })

  // 4
  test('every product has a visible price', async ({ loggedInPage }) => {
    const page = loggedInPage.page
    const prices = page.getByTestId('inventory-item-price')
    await expect(prices).toHaveCount(6)
    const count = await prices.count()
    for (let i = 0; i < count; i++) {
      await expect(prices.nth(i)).toBeVisible()
    }
  })

  // 5
  test('every product has an Add to cart button', async ({ loggedInPage }) => {
    const count = await loggedInPage.items.count()
    for (let i = 0; i < count; i++) {
      await expect(
        loggedInPage.items.nth(i).getByRole('button', { name: /add to cart/i }),
      ).toBeVisible()
    }
  })

  // 6
  test('sort by Name A to Z orders names ascending', async ({ loggedInPage }) => {
    await loggedInPage.sortBy('az')
    const names = await loggedInPage.productNames()
    const sorted = [...names].sort((a, b) => a.localeCompare(b))
    expect(names).toEqual(sorted)
  })

  // 7
  test('sort by Name Z to A orders names descending', async ({ loggedInPage }) => {
    await loggedInPage.sortBy('za')
    const names = await loggedInPage.productNames()
    const sorted = [...names].sort((a, b) => b.localeCompare(a))
    expect(names).toEqual(sorted)
  })

  // 8
  test('sort by Price low to high orders prices ascending', async ({ loggedInPage }) => {
    await loggedInPage.sortBy('lohi')
    const prices = await loggedInPage.productPrices()
    const sorted = [...prices].sort((a, b) => a - b)
    expect(prices).toEqual(sorted)
  })

  // 9
  test('sort by Price high to low orders prices descending', async ({ loggedInPage }) => {
    await loggedInPage.sortBy('hilo')
    const prices = await loggedInPage.productPrices()
    const sorted = [...prices].sort((a, b) => b - a)
    expect(prices).toEqual(sorted)
  })

  // 10
  test('add Sauce Labs Backpack updates cart badge to 1', async ({ loggedInPage }) => {
    await loggedInPage.addToCartByName('Sauce Labs Backpack')
    await loggedInPage.expectCartCount(1)
  })

  // 11
  test('add two products updates cart badge to 2', async ({ loggedInPage }) => {
    await loggedInPage.addToCartByName('Sauce Labs Backpack')
    await loggedInPage.addToCartByName('Sauce Labs Bike Light')
    await loggedInPage.expectCartCount(2)
  })

  // 12
  test('add then the button becomes Remove', async ({ loggedInPage }) => {
    await loggedInPage.addToCartByName('Sauce Labs Backpack')
    const item = loggedInPage.items.filter({ hasText: 'Sauce Labs Backpack' })
    await expect(item.getByRole('button', { name: /remove/i })).toBeVisible()
  })

  // 13
  test('remove a product updates the badge back to empty', async ({ loggedInPage }) => {
    await loggedInPage.addToCartByName('Sauce Labs Backpack')
    await loggedInPage.expectCartCount(1)
    await loggedInPage.removeFromCartByName('Sauce Labs Backpack')
    await loggedInPage.expectCartCount(0)
  })

  // 14
  test('add all six products shows badge 6', async ({ loggedInPage }) => {
    const names = await loggedInPage.productNames()
    for (const name of names) {
      await loggedInPage.addToCartByName(name)
    }
    await loggedInPage.expectCartCount(6)
  })

  // 15
  test('cart link navigates to the cart page', async ({ loggedInPage }) => {
    await loggedInPage.cartLink.click()
    const page = loggedInPage.page
    await expect(page).toHaveURL(/cart\.html/)
  })

  // 16
  test('open a product opens its detail page', async ({ loggedInPage }) => {
    await loggedInPage.openProductByName('Sauce Labs Backpack')
    const page = loggedInPage.page
    await expect(page).toHaveURL(/inventory-item\.html/)
  })

  // 17
  test('product detail shows the correct name', async ({ loggedInPage }) => {
    await loggedInPage.openProductByName('Sauce Labs Backpack')
    const detail = new ProductDetailPage(loggedInPage.page)
    await detail.expectName('Sauce Labs Backpack')
  })

  // 18
  test('product detail shows a price', async ({ loggedInPage }) => {
    await loggedInPage.openProductByName('Sauce Labs Backpack')
    const detail = new ProductDetailPage(loggedInPage.page)
    await expect(detail.price).toBeVisible()
    await expect(detail.price).toHaveText(/\$\d+\.\d{2}/)
  })

  // 19
  test('back button returns to the inventory page', async ({ loggedInPage }) => {
    await loggedInPage.openProductByName('Sauce Labs Backpack')
    const detail = new ProductDetailPage(loggedInPage.page)
    await detail.goBack()
    const page = loggedInPage.page
    await expect(page).toHaveURL(/inventory\.html/)
    await expect(loggedInPage.title).toBeVisible()
  })

  // 20
  test('add to cart from the detail page updates the badge', async ({ loggedInPage }) => {
    await loggedInPage.openProductByName('Sauce Labs Backpack')
    const detail = new ProductDetailPage(loggedInPage.page)
    await detail.addToCart()
    await expect(loggedInPage.cartBadge).toHaveText('1')
  })

  // 21
  test('cart badge persists from inventory to detail page', async ({ loggedInPage }) => {
    await loggedInPage.addToCartByName('Sauce Labs Backpack')
    await loggedInPage.expectCartCount(1)
    await loggedInPage.openProductByName('Sauce Labs Backpack')
    const page = loggedInPage.page
    await expect(page).toHaveURL(/inventory-item\.html/)
    await expect(loggedInPage.cartBadge).toHaveText('1')
  })

  // 22
  test('open menu shows the All Items, About, Logout, Reset links', async ({ loggedInPage }) => {
    await loggedInPage.openMenu()
    const page = loggedInPage.page
    await expect(page.getByTestId('inventory-sidebar-link')).toBeVisible()
    await expect(page.getByTestId('about-sidebar-link')).toBeVisible()
    await expect(page.getByTestId('logout-sidebar-link')).toBeVisible()
    await expect(page.getByTestId('reset-sidebar-link')).toBeVisible()
  })

  // 23
  test('reset app state clears the cart badge after adding an item', async ({ loggedInPage }) => {
    await loggedInPage.addToCartByName('Sauce Labs Backpack')
    await loggedInPage.expectCartCount(1)
    await loggedInPage.resetAppState()
    await loggedInPage.expectCartCount(0)
  })

  // 24
  test('footer shows the Sauce Labs copyright and three social links', async ({ loggedInPage }) => {
    const page = loggedInPage.page
    await expect(page.getByTestId('footer-copy')).toContainText('Sauce Labs')
    await expect(page.getByTestId('social-twitter')).toBeVisible()
    await expect(page.getByTestId('social-facebook')).toBeVisible()
    await expect(page.getByTestId('social-linkedin')).toBeVisible()
  })
})
