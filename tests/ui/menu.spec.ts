import { test, expect } from '../../fixtures/test-fixtures'
import { MenuPage } from '../../page-objects/MenuPage'

test.describe('Menu', () => {
  test('opens and shows the menu links', async ({ loggedInPage }) => {
    const menu = new MenuPage(loggedInPage.page)
    await menu.open()
    await menu.expectMenuOpen()
  })

  test('about link navigates to Sauce Labs', async ({ loggedInPage }) => {
    const menu = new MenuPage(loggedInPage.page)
    await menu.clickAbout()
    await expect(loggedInPage.page).toHaveURL(/saucelabs\.com/i)
  })

  test('logout returns to the login page', async ({ loggedInPage }) => {
    const menu = new MenuPage(loggedInPage.page)
    await menu.logout()
    await expect(loggedInPage.page).toHaveURL(/saucedemo\.com\/?$/)
    await expect(loggedInPage.page.getByTestId('login-button')).toBeVisible()
  })

  test('reset app state clears cart badge after adding an item', async ({ loggedInPage }) => {
    const menu = new MenuPage(loggedInPage.page)
    await loggedInPage.addToCartByName('Sauce Labs Backpack')
    await loggedInPage.expectCartCount(1)
    await menu.resetAppState()
    await loggedInPage.expectCartCount(0)
  })
})
