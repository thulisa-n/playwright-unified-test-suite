import { type Page, type Locator, expect } from '@playwright/test'

export class ProductDetailPage {
  readonly page: Page
  readonly name: Locator
  readonly price: Locator
  readonly addButton: Locator
  readonly removeButton: Locator
  readonly backButton: Locator

  constructor(page: Page) {
    this.page = page
    this.name = page.getByTestId('inventory-item-name')
    this.price = page.getByTestId('inventory-item-price')
    this.addButton = page.getByRole('button', { name: /add to cart/i })
    this.removeButton = page.getByRole('button', { name: /remove/i })
    this.backButton = page.getByTestId('back-to-products')
  }

  async expectName(text: string) {
    await expect(this.name).toHaveText(text)
  }

  async addToCart() {
    await this.addButton.click()
  }

  async goBack() {
    await this.backButton.click()
  }
}
