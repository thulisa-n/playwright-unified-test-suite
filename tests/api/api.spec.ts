import { test, expect } from '@playwright/test'

test.describe('API', () => {
  test('GET /products returns 200 and an array', async ({ request }) => {
    const res = await request.get('/products')
    expect(res.status()).toBe(200)
    expect(Array.isArray(await res.json())).toBe(true)
  })

  test('GET /products returns 20 products', async ({ request }) => {
    const products = await (await request.get('/products')).json()
    expect(products).toHaveLength(20)
  })

  test('GET /products/1 returns product with id 1', async ({ request }) => {
    const product = await (await request.get('/products/1')).json()
    expect(product.id).toBe(1)
  })

  test('GET /products/1 has title and price', async ({ request }) => {
    const product = await (await request.get('/products/1')).json()
    expect(product).toHaveProperty('title')
    expect(typeof product.price).toBe('number')
  })

  test('GET /products/9999 returns 404', async ({ request }) => {
    const res = await request.get('/products/9999')
    expect(res.status()).toBe(404)
  })

  test('GET /products/categories returns categories', async ({ request }) => {
    const res = await request.get('/products/categories')
    expect(res.status()).toBe(200)
    expect(await res.json()).toContain('electronics')
  })

  test('POST /products creates a product and returns 201', async ({ request }) => {
    const res = await request.post('/products', { data: { title: 'New', price: 9.99 } })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.id).toBe(21)
    expect(body.title).toBe('New')
  })

  test('GET /users returns 200 and an array', async ({ request }) => {
    const res = await request.get('/users')
    expect(res.status()).toBe(200)
    expect(Array.isArray(await res.json())).toBe(true)
  })

  test('GET /users/2 returns Bob', async ({ request }) => {
    const user = await (await request.get('/users/2')).json()
    expect(user.name).toBe('Bob')
  })

  test('GET /users/999 returns 404', async ({ request }) => {
    const res = await request.get('/users/999')
    expect(res.status()).toBe(404)
  })

  test('POST /login with valid credentials returns a token', async ({ request }) => {
    const res = await request.post('/login', { data: { email: 'a@b.com', password: 'pw' } })
    expect(res.status()).toBe(200)
    expect((await res.json()).token).toBeTruthy()
  })

  test('POST /login missing password returns 400', async ({ request }) => {
    const res = await request.post('/login', { data: { email: 'a@b.com' } })
    expect(res.status()).toBe(400)
  })

  test('GET /posts returns 100 posts', async ({ request }) => {
    const posts = await (await request.get('/posts')).json()
    expect(posts).toHaveLength(100)
  })

  test('PUT /posts/1 updates the post', async ({ request }) => {
    const res = await request.put('/posts/1', { data: { title: 'Updated' } })
    expect(res.status()).toBe(200)
    expect((await res.json()).title).toBe('Updated')
  })

  test('DELETE /posts/1 returns 200', async ({ request }) => {
    const res = await request.delete('/posts/1')
    expect(res.status()).toBe(200)
  })
})
