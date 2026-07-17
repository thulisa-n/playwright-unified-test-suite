import { test, expect } from '@playwright/test'
import { LoginPage } from '../../page-objects/LoginPage'
import { InventoryPage } from '../../page-objects/InventoryPage'
import { CartPage } from '../../page-objects/CartPage'
import { CheckoutPage } from '../../page-objects/CheckoutPage'
import { USERS, PASSWORD } from '../../data/users'

const BACKPACK = 'Sauce Labs Backpack'
const BIKE_LIGHT = 'Sauce Labs Bike Light'
const BACKPACK_PRICE = 29.99
const BIKE_LIGHT_PRICE = 9.99

test.describe('Checkout', () => {
  let inventory: InventoryPage
  let cart: CartPage
  let checkout: CheckoutPage

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await login.login(USERS.standard, PASSWORD)
    inventory = new InventoryPage(page)
    await inventory.expectLoaded()
    cart = new CartPage(page)
    checkout = new CheckoutPage(page)
  })

  async function reachStepOne(...names: string[]) {
    const items = names.length ? names : [BACKPACK]
    for (const name of items) {
      await inventory.addToCartByName(name)
    }
    await cart.goto()
    await cart.checkout()
    await checkout.expectOnStepOne()
  }

  async function reachOverview(...names: string[]) {
    await reachStepOne(...names)
    await checkout.fillInfo('Ada', 'Lovelace', '12345')
    await checkout.continue()
    await checkout.expectOnStepTwo()
  }

  // 1
  test('step one shows the first name field', async () => {
    await reachStepOne()
    await expect(checkout.firstName).toBeVisible()
  })

  // 2
  test('step one shows the last name field', async () => {
    await reachStepOne()
    await expect(checkout.lastName).toBeVisible()
  })

  // 3
  test('step one shows the postal code field', async () => {
    await reachStepOne()
    await expect(checkout.postalCode).toBeVisible()
  })

  // 4
  test('continue with an empty form shows First Name is required', async () => {
    await reachStepOne()
    await checkout.continue()
    await expect(checkout.errorMessage).toContainText('Error: First Name is required')
  })

  // 5
  test('continue with only first name shows Last Name is required', async () => {
    await reachStepOne()
    await checkout.firstName.fill('Ada')
    await checkout.continue()
    await expect(checkout.errorMessage).toContainText('Error: Last Name is required')
  })

  // 6
  test('continue with first and last but no postal shows Postal Code is required', async () => {
    await reachStepOne()
    await checkout.firstName.fill('Ada')
    await checkout.lastName.fill('Lovelace')
    await checkout.continue()
    await expect(checkout.errorMessage).toContainText('Error: Postal Code is required')
  })

  // 7
  test('the error can be dismissed with the error button', async () => {
    await reachStepOne()
    await checkout.continue()
    await expect(checkout.errorMessage).toBeVisible()
    await checkout.page.getByTestId('error-button').click()
    await expect(checkout.errorMessage).toHaveCount(0)
  })

  // 8
  test('filling all three fields and continuing goes to the overview', async () => {
    await reachStepOne()
    await checkout.fillInfo('Ada', 'Lovelace', '12345')
    await checkout.continue()
    await expect(checkout.page).toHaveURL(/checkout-step-two\.html/)
  })

  // 9
  test('cancel on step one returns to the cart page', async () => {
    await reachStepOne()
    await checkout.cancel()
    await expect(checkout.page).toHaveURL(/cart\.html/)
    await expect(cart.checkoutButton).toBeVisible()
  })

  // 10
  test('the first name field accepts and keeps typed input', async () => {
    await reachStepOne()
    await checkout.firstName.fill('Grace')
    await expect(checkout.firstName).toHaveValue('Grace')
  })

  // 11
  test('overview lists the added item', async () => {
    await reachOverview()
    await expect(cart.items.getByTestId('inventory-item-name')).toHaveText(BACKPACK)
  })

  // 12
  test('overview shows the item total label', async () => {
    await reachOverview()
    await expect(checkout.itemTotalLabel).toBeVisible()
    await expect(checkout.itemTotalLabel).toContainText('Item total:')
  })

  // 13
  test('overview shows the tax label', async () => {
    await reachOverview()
    await expect(checkout.taxLabel).toBeVisible()
    await expect(checkout.taxLabel).toContainText('Tax:')
  })

  // 14
  test('overview shows the total label', async () => {
    await reachOverview()
    await expect(checkout.totalLabel).toBeVisible()
    await expect(checkout.totalLabel).toContainText('Total:')
  })

  // 15
  test('finish navigates to the complete page', async () => {
    await reachOverview()
    await checkout.finish()
    await expect(checkout.page).toHaveURL(/checkout-complete\.html/)
  })

  // 16
  test('complete page shows Thank you for your order', async () => {
    await reachOverview()
    await checkout.finish()
    await expect(checkout.completeHeader).toHaveText('Thank you for your order!')
  })

  // 17
  test('back home returns to the inventory page', async () => {
    await reachOverview()
    await checkout.finish()
    await checkout.backHomeButton.click()
    await expect(checkout.page).toHaveURL(/inventory\.html/)
    await expect(inventory.title).toBeVisible()
  })

  // 18
  test('cancel on the overview returns to the inventory page', async () => {
    await reachOverview()
    await checkout.cancel()
    await expect(checkout.page).toHaveURL(/inventory\.html/)
    await expect(inventory.title).toBeVisible()
  })

  // 19
  test('item total equals the single item price', async () => {
    await reachOverview()
    expect(await checkout.itemTotalValue()).toBeCloseTo(BACKPACK_PRICE, 2)
  })

  // 20
  test('tax is greater than zero for a non-empty order', async () => {
    await reachOverview()
    expect(await checkout.taxValue()).toBeGreaterThan(0)
  })

  // 21
  test('total equals item total plus tax', async () => {
    await reachOverview()
    const itemTotal = await checkout.itemTotalValue()
    const tax = await checkout.taxValue()
    const total = await checkout.totalValue()
    expect(total).toBeCloseTo(itemTotal + tax, 2)
  })

  // 22
  test('two items: item total equals the sum of the two prices', async () => {
    await reachOverview(BACKPACK, BIKE_LIGHT)
    expect(await checkout.itemTotalValue()).toBeCloseTo(BACKPACK_PRICE + BIKE_LIGHT_PRICE, 2)
  })

  // 23
  test('two items: overview shows two line items', async () => {
    await reachOverview(BACKPACK, BIKE_LIGHT)
    await expect(cart.items).toHaveCount(2)
  })

  // 24
  test('completing the order clears the cart badge back on inventory', async () => {
    await reachOverview()
    await checkout.finish()
    await checkout.backHomeButton.click()
    await inventory.expectLoaded()
    await expect(inventory.cartBadge).toHaveCount(0)
  })

  // 25
  test('overview shows the correct single line item count', async () => {
    await reachOverview()
    await expect(cart.items).toHaveCount(1)
  })

  // 26
  test('backpack price appears on the overview', async () => {
    await reachOverview()
    const line = cart.items.filter({ hasText: BACKPACK })
    await expect(line.getByTestId('inventory-item-price')).toHaveText('$29.99')
  })

  // 27
  test('the complete page shows the back home button', async () => {
    await reachOverview()
    await checkout.finish()
    await expect(checkout.backHomeButton).toBeVisible()
  })
})
