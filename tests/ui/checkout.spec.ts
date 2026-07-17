import { test, expect } from '../../fixtures/test-fixtures'
import { InventoryPage } from '../../page-objects/InventoryPage'
import { CartPage } from '../../page-objects/CartPage'
import { CheckoutPage } from '../../page-objects/CheckoutPage'

const BACKPACK = 'Sauce Labs Backpack'
const BIKE_LIGHT = 'Sauce Labs Bike Light'
const BACKPACK_PRICE = 29.99
const BIKE_LIGHT_PRICE = 9.99

test.describe('Checkout', () => {
  async function reachStepOne(loggedInPage: InventoryPage, ...names: string[]) {
    const inventory = loggedInPage
    const cart = new CartPage(loggedInPage.page)
    const checkout = new CheckoutPage(loggedInPage.page)
    const items = names.length ? names : [BACKPACK]
    for (const name of items) {
      await inventory.addToCartByName(name)
    }
    await cart.goto()
    await cart.checkout()
    await checkout.expectOnStepOne()
    return { inventory, cart, checkout }
  }

  async function reachOverview(loggedInPage: InventoryPage, ...names: string[]) {
    const context = await reachStepOne(loggedInPage, ...names)
    const { checkout } = context
    await checkout.fillInfo('Ada', 'Lovelace', '12345')
    await checkout.continue()
    await checkout.expectOnStepTwo()
    return context
  }

  // 1
  test('step one shows the first name field', async ({ loggedInPage }) => {
    const { checkout } = await reachStepOne(loggedInPage)
    await expect(checkout.firstName).toBeVisible()
  })

  // 2
  test('step one shows the last name field', async ({ loggedInPage }) => {
    const { checkout } = await reachStepOne(loggedInPage)
    await expect(checkout.lastName).toBeVisible()
  })

  // 3
  test('step one shows the postal code field', async ({ loggedInPage }) => {
    const { checkout } = await reachStepOne(loggedInPage)
    await expect(checkout.postalCode).toBeVisible()
  })

  // 4
  test('continue with an empty form shows First Name is required', async ({ loggedInPage }) => {
    const { checkout } = await reachStepOne(loggedInPage)
    await checkout.continue()
    await expect(checkout.errorMessage).toContainText('Error: First Name is required')
  })

  // 5
  test('continue with only first name shows Last Name is required', async ({ loggedInPage }) => {
    const { checkout } = await reachStepOne(loggedInPage)
    await checkout.firstName.fill('Ada')
    await checkout.continue()
    await expect(checkout.errorMessage).toContainText('Error: Last Name is required')
  })

  // 6
  test('continue with first and last but no postal shows Postal Code is required', async ({ loggedInPage }) => {
    const { checkout } = await reachStepOne(loggedInPage)
    await checkout.firstName.fill('Ada')
    await checkout.lastName.fill('Lovelace')
    await checkout.continue()
    await expect(checkout.errorMessage).toContainText('Error: Postal Code is required')
  })

  // 7
  test('the error can be dismissed with the error button', async ({ loggedInPage }) => {
    const { checkout } = await reachStepOne(loggedInPage)
    await checkout.continue()
    await expect(checkout.errorMessage).toBeVisible()
    await checkout.page.getByTestId('error-button').click()
    await expect(checkout.errorMessage).toHaveCount(0)
  })

  // 8
  test('filling all three fields and continuing goes to the overview', async ({ loggedInPage }) => {
    const { checkout } = await reachStepOne(loggedInPage)
    await checkout.fillInfo('Ada', 'Lovelace', '12345')
    await checkout.continue()
    await expect(checkout.page).toHaveURL(/checkout-step-two\.html/)
  })

  // 9
  test('cancel on step one returns to the cart page', async ({ loggedInPage }) => {
    const { cart, checkout } = await reachStepOne(loggedInPage)
    await checkout.cancel()
    await expect(checkout.page).toHaveURL(/cart\.html/)
    await expect(cart.checkoutButton).toBeVisible()
  })

  // 10
  test('the first name field accepts and keeps typed input', async ({ loggedInPage }) => {
    const { checkout } = await reachStepOne(loggedInPage)
    await checkout.firstName.fill('Grace')
    await expect(checkout.firstName).toHaveValue('Grace')
  })

  // 11
  test('overview lists the added item', async ({ loggedInPage }) => {
    const { cart } = await reachOverview(loggedInPage)
    await expect(cart.items.getByTestId('inventory-item-name')).toHaveText(BACKPACK)
  })

  // 12
  test('overview shows the item total label', async ({ loggedInPage }) => {
    const { checkout } = await reachOverview(loggedInPage)
    await expect(checkout.itemTotalLabel).toBeVisible()
    await expect(checkout.itemTotalLabel).toContainText('Item total:')
  })

  // 13
  test('overview shows the tax label', async ({ loggedInPage }) => {
    const { checkout } = await reachOverview(loggedInPage)
    await expect(checkout.taxLabel).toBeVisible()
    await expect(checkout.taxLabel).toContainText('Tax:')
  })

  // 14
  test('overview shows the total label', async ({ loggedInPage }) => {
    const { checkout } = await reachOverview(loggedInPage)
    await expect(checkout.totalLabel).toBeVisible()
    await expect(checkout.totalLabel).toContainText('Total:')
  })

  // 15
  test('finish navigates to the complete page', async ({ loggedInPage }) => {
    const { checkout } = await reachOverview(loggedInPage)
    await checkout.finish()
    await expect(checkout.page).toHaveURL(/checkout-complete\.html/)
  })

  // 16
  test('complete page shows Thank you for your order', async ({ loggedInPage }) => {
    const { checkout } = await reachOverview(loggedInPage)
    await checkout.finish()
    await expect(checkout.completeHeader).toHaveText('Thank you for your order!')
  })

  // 17
  test('back home returns to the inventory page', async ({ loggedInPage }) => {
    const { inventory, checkout } = await reachOverview(loggedInPage)
    await checkout.finish()
    await checkout.backHomeButton.click()
    await expect(checkout.page).toHaveURL(/inventory\.html/)
    await expect(inventory.title).toBeVisible()
  })

  // 18
  test('cancel on the overview returns to the inventory page', async ({ loggedInPage }) => {
    const { inventory, checkout } = await reachOverview(loggedInPage)
    await checkout.cancel()
    await expect(checkout.page).toHaveURL(/inventory\.html/)
    await expect(inventory.title).toBeVisible()
  })

  // 19
  test('item total equals the single item price', async ({ loggedInPage }) => {
    const { checkout } = await reachOverview(loggedInPage)
    expect(await checkout.itemTotalValue()).toBeCloseTo(BACKPACK_PRICE, 2)
  })

  // 20
  test('tax is greater than zero for a non-empty order', async ({ loggedInPage }) => {
    const { checkout } = await reachOverview(loggedInPage)
    expect(await checkout.taxValue()).toBeGreaterThan(0)
  })

  // 21
  test('total equals item total plus tax', async ({ loggedInPage }) => {
    const { checkout } = await reachOverview(loggedInPage)
    const itemTotal = await checkout.itemTotalValue()
    const tax = await checkout.taxValue()
    const total = await checkout.totalValue()
    expect(total).toBeCloseTo(itemTotal + tax, 2)
  })

  // 22
  test('two items: item total equals the sum of the two prices', async ({ loggedInPage }) => {
    const { checkout } = await reachOverview(loggedInPage, BACKPACK, BIKE_LIGHT)
    expect(await checkout.itemTotalValue()).toBeCloseTo(BACKPACK_PRICE + BIKE_LIGHT_PRICE, 2)
  })

  // 23
  test('two items: overview shows two line items', async ({ loggedInPage }) => {
    const { cart } = await reachOverview(loggedInPage, BACKPACK, BIKE_LIGHT)
    await expect(cart.items).toHaveCount(2)
  })

  // 24
  test('completing the order clears the cart badge back on inventory', async ({ loggedInPage }) => {
    const { inventory, checkout } = await reachOverview(loggedInPage)
    await checkout.finish()
    await checkout.backHomeButton.click()
    await inventory.expectLoaded()
    await expect(inventory.cartBadge).toHaveCount(0)
  })

  // 25
  test('overview shows the correct single line item count', async ({ loggedInPage }) => {
    const { cart } = await reachOverview(loggedInPage)
    await expect(cart.items).toHaveCount(1)
  })

  // 26
  test('backpack price appears on the overview', async ({ loggedInPage }) => {
    const { cart } = await reachOverview(loggedInPage)
    const line = cart.items.filter({ hasText: BACKPACK })
    await expect(line.getByTestId('inventory-item-price')).toHaveText('$29.99')
  })

  // 27
  test('the complete page shows the back home button', async ({ loggedInPage }) => {
    const { checkout } = await reachOverview(loggedInPage)
    await checkout.finish()
    await expect(checkout.backHomeButton).toBeVisible()
  })
})
