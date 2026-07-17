// course-assets/playwright-project-pack/fixtures/test-fixtures.ts
// A custom fixture that logs in as the standard user and hands the test an
// InventoryPage that is already loaded. Import { test, expect } from this file
// instead of '@playwright/test' to get the loggedInPage fixture for free.
import { test as base } from '@playwright/test'
import { LoginPage } from '../page-objects/LoginPage'
import { InventoryPage } from '../page-objects/InventoryPage'
import { USERS, PASSWORD } from '../data/users'

interface Fixtures {
  loggedInPage: InventoryPage
}

export const test = base.extend<Fixtures>({
  loggedInPage: async ({ page }, use) => {
    const login = new LoginPage(page)
    await login.goto()
    await login.login(USERS.standard, PASSWORD)
    const inventory = new InventoryPage(page)
    await inventory.expectLoaded()
    await use(inventory)
  },
})

export { expect } from '@playwright/test'
