import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { test, expect } from '../../fixtures/test-fixtures'
import { LoginPage } from '../../page-objects/LoginPage'
import { CartPage } from '../../page-objects/CartPage'
import { CheckoutPage } from '../../page-objects/CheckoutPage'

async function expectNoSeriousOrCriticalViolations(
  page: Page,
  options?: { disableRules?: string[] },
) {
  let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa'])
  if (options?.disableRules?.length) {
    builder = builder.disableRules(options.disableRules)
  }
  const results = await builder.analyze()
  const blocking = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  )
  expect(blocking).toEqual([])
}

test.describe('Accessibility', () => {
  test('login page has no serious or critical accessibility violations', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await expectNoSeriousOrCriticalViolations(page)
  })

  test('inventory page has no serious or critical accessibility violations', async ({ loggedInPage }) => {
    // SauceDemo's sort select has no accessible name and is third-party markup we cannot change.
    await expectNoSeriousOrCriticalViolations(loggedInPage.page, { disableRules: ['select-name'] })
  })

  test('checkout form has no serious or critical accessibility violations', async ({ loggedInPage }) => {
    const cart = new CartPage(loggedInPage.page)
    const checkout = new CheckoutPage(loggedInPage.page)
    await cart.goto()
    await cart.checkout()
    await checkout.expectOnStepOne()
    await expectNoSeriousOrCriticalViolations(loggedInPage.page)
  })
})
