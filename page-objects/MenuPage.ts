import { type Page, type Locator, expect } from '@playwright/test'

export class MenuPage {
  readonly page: Page
  readonly menuButton: Locator
  readonly aboutLink: Locator
  readonly logoutLink: Locator
  readonly resetLink: Locator
  readonly allItemsLink: Locator

  constructor(page: Page) {
    this.page = page
    this.menuButton = page.getByRole('button', { name: 'Open Menu' })
    this.aboutLink = page.getByTestId('about-sidebar-link')
    this.logoutLink = page.getByTestId('logout-sidebar-link')
    this.resetLink = page.getByTestId('reset-sidebar-link')
    this.allItemsLink = page.getByTestId('inventory-sidebar-link')
  }

  async open() {
    await this.menuButton.click()
  }

  async clickAbout() {
    await this.open()
    await this.aboutLink.click()
  }

  async logout() {
    await this.open()
    await this.logoutLink.click()
  }

  async resetAppState() {
    await this.open()
    await this.resetLink.click()
  }

  async expectMenuOpen() {
    await expect(this.aboutLink).toBeVisible()
    await expect(this.logoutLink).toBeVisible()
    await expect(this.resetLink).toBeVisible()
    await expect(this.allItemsLink).toBeVisible()
  }
}
