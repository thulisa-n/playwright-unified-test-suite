import { test, expect } from '@playwright/test'
import { LoginPage } from '../../page-objects/LoginPage'
import { USERS, PASSWORD } from '../../data/users'

test.describe('Login', () => {
  let login: LoginPage

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page)
    await login.goto()
  })

  test('login form is visible', async () => {
    await expect(login.username).toBeVisible()
    await expect(login.password).toBeVisible()
    await expect(login.loginButton).toBeVisible()
  })

  test('standard_user logs in successfully', async () => {
    await login.login(USERS.standard, PASSWORD)
    await login.expectLoggedIn()
  })

  test('problem_user logs in successfully', async () => {
    await login.login(USERS.problem, PASSWORD)
    await login.expectLoggedIn()
  })

  test('performance_glitch_user logs in successfully', async () => {
    await login.login(USERS.glitch, PASSWORD)
    await login.expectLoggedIn()
  })

  test('error_user logs in successfully', async () => {
    await login.login(USERS.error, PASSWORD)
    await login.expectLoggedIn()
  })

  test('visual_user logs in successfully', async () => {
    await login.login(USERS.visual, PASSWORD)
    await login.expectLoggedIn()
  })

  test('locked_out_user is rejected', async () => {
    await login.login(USERS.lockedOut, PASSWORD)
    await login.expectError(/locked out/i)
  })

  test('wrong password is rejected', async () => {
    await login.login(USERS.standard, 'wrong_password')
    await login.expectError(/do not match/i)
  })

  test('unknown user is rejected', async () => {
    await login.login('no_such_user', PASSWORD)
    await login.expectError(/do not match/i)
  })

  test('empty username shows required error', async () => {
    await login.login('', PASSWORD)
    await login.expectError(/Username is required/i)
  })

  test('empty password shows required error', async () => {
    await login.login(USERS.standard, '')
    await login.expectError(/Password is required/i)
  })

  test('empty form shows username required error', async () => {
    await login.loginButton.click()
    await login.expectError(/Username is required/i)
  })

  test('error message can be dismissed', async ({ page }) => {
    await login.login(USERS.lockedOut, PASSWORD)
    await login.expectError(/locked out/i)
    await page.getByTestId('error-button').click()
    await expect(login.error).toHaveCount(0)
  })

  test('successful login then logout returns to login', async ({ page }) => {
    await login.login(USERS.standard, PASSWORD)
    await login.expectLoggedIn()
    await page.getByRole('button', { name: 'Open Menu' }).click()
    await page.getByTestId('logout-sidebar-link').click()
    await expect(login.loginButton).toBeVisible()
  })
})
