import { type Page, type Locator, expect } from '@playwright/test'

export class InventoryPage {
  readonly page: Page
  readonly title: Locator
  readonly cartLink: Locator
  readonly cartBadge: Locator
  readonly items: Locator
  readonly sortDropdown: Locator
  readonly menuButton: Locator

  constructor(page: Page) {
    this.page = page
    this.title = page.getByText('Products', { exact: true })
    this.cartLink = page.getByTestId('shopping-cart-link')
    this.cartBadge = page.getByTestId('shopping-cart-badge')
    this.items = page.getByTestId('inventory-item')
    this.sortDropdown = page.getByTestId('product-sort-container')
    this.menuButton = page.getByRole('button', { name: 'Open Menu' })
  }

  async expectLoaded() {
    await expect(this.title).toBeVisible()
  }

  async addToCartByName(name: string) {
    const item = this.items.filter({ hasText: name })
    await item.getByRole('button', { name: /add to cart/i }).click()
  }

  async removeFromCartByName(name: string) {
    const item = this.items.filter({ hasText: name })
    await item.getByRole('button', { name: /remove/i }).click()
  }

  async expectCartCount(count: number) {
    if (count === 0) {
      await expect(this.cartBadge).toHaveCount(0)
    } else {
      await expect(this.cartBadge).toHaveText(String(count))
    }
  }

  async sortBy(value: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.sortDropdown.selectOption(value)
  }

  async productNames(): Promise<string[]> {
    return this.page.getByTestId('inventory-item-name').allInnerTexts()
  }

  async productPrices(): Promise<number[]> {
    const texts = await this.page.getByTestId('inventory-item-price').allInnerTexts()
    return texts.map((t) => Number(t.replace(/^\$/, '')))
  }

  async openProductByName(name: string) {
    await this.page.getByTestId('inventory-item-name').filter({ hasText: name }).click()
  }

  async openMenu() {
    await this.menuButton.click()
  }

  async resetAppState() {
    await this.openMenu()
    await this.page.getByTestId('reset-sidebar-link').click()
  }

  itemCount() {
    return this.items.count()
  }
}
