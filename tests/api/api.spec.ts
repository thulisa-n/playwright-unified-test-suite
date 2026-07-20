import { test, expect } from '@playwright/test'
import Ajv from 'ajv'

const ajv = new Ajv({ allErrors: true })

const productSchema = {
  type: 'object',
  required: ['id', 'title', 'price', 'category', 'description'],
  additionalProperties: false,
  properties: {
    id: { type: 'integer' },
    title: { type: 'string', minLength: 1 },
    price: { type: 'number', minimum: 0 },
    category: { type: 'string', enum: ['electronics', 'clothing'] },
    description: { type: 'string', minLength: 1 },
  },
} as const

const userSchema = {
  type: 'object',
  required: ['id', 'name', 'email'],
  additionalProperties: false,
  properties: {
    id: { type: 'integer' },
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', minLength: 3 },
  },
} as const

const errorSchema = {
  type: 'object',
  required: ['error'],
  additionalProperties: false,
  properties: {
    error: { type: 'string', minLength: 1 },
  },
} as const

const tokenSchema = {
  type: 'object',
  required: ['token'],
  additionalProperties: false,
  properties: {
    token: { type: 'string', minLength: 1 },
  },
} as const

const postSchema = {
  type: 'object',
  required: ['id', 'title', 'body', 'userId'],
  additionalProperties: false,
  properties: {
    id: { type: 'integer' },
    title: { type: 'string', minLength: 1 },
    body: { type: 'string', minLength: 1 },
    userId: { type: 'integer' },
  },
} as const

const createdProductSchema = {
  type: 'object',
  required: ['id', 'title', 'price'],
  additionalProperties: false,
  properties: {
    id: { type: 'integer' },
    title: { type: 'string', minLength: 1 },
    price: { type: 'number', minimum: 0 },
  },
} as const

const updatedPostSchema = {
  type: 'object',
  required: ['id', 'title'],
  additionalProperties: false,
  properties: {
    id: { type: 'integer' },
    title: { type: 'string', minLength: 1 },
  },
} as const

const emptyObjectSchema = {
  type: 'object',
  required: [],
  additionalProperties: false,
  properties: {},
} as const

const validateProduct = ajv.compile(productSchema)
const validateUser = ajv.compile(userSchema)
const validateError = ajv.compile(errorSchema)
const validateToken = ajv.compile(tokenSchema)
const validatePost = ajv.compile(postSchema)
const validateCreatedProduct = ajv.compile(createdProductSchema)
const validateUpdatedPost = ajv.compile(updatedPostSchema)
const validateEmptyObject = ajv.compile(emptyObjectSchema)

function expectContractValid(
  valid: boolean,
  errors: ReturnType<typeof ajv.errorsText>,
  label: string,
) {
  expect(valid, `${label}: ${errors}`).toBe(true)
}

test.describe('API', () => {
  test('GET /products returns 200 and an array', async ({ request }) => {
    const res = await request.get('/products')
    expect(res.status()).toBe(200)
    const products = await res.json()
    expect(Array.isArray(products)).toBe(true)
    for (const product of products) {
      const valid = validateProduct(product)
      expectContractValid(valid, ajv.errorsText(validateProduct.errors), 'product contract')
    }
  })

  test('GET /products returns 20 products', async ({ request }) => {
    const products = await (await request.get('/products')).json()
    expect(products).toHaveLength(20)
  })

  test('GET /products/1 returns product with id 1', async ({ request }) => {
    const product = await (await request.get('/products/1')).json()
    expect(product.id).toBe(1)
    const valid = validateProduct(product)
    expectContractValid(valid, ajv.errorsText(validateProduct.errors), 'single product contract')
  })

  test('GET /products/1 has title and price', async ({ request }) => {
    const product = await (await request.get('/products/1')).json()
    expect(product).toHaveProperty('title')
    expect(typeof product.price).toBe('number')
  })

  test('GET /products/9999 returns 404', async ({ request }) => {
    const res = await request.get('/products/9999')
    expect(res.status()).toBe(404)
    const body = await res.json()
    const valid = validateError(body)
    expectContractValid(valid, ajv.errorsText(validateError.errors), '404 error contract')
  })

  test('GET /products/categories returns categories', async ({ request }) => {
    const res = await request.get('/products/categories')
    expect(res.status()).toBe(200)
    const categories = await res.json()
    expect(categories).toContain('electronics')
    expect(Array.isArray(categories)).toBe(true)
    for (const category of categories) {
      expect(typeof category).toBe('string')
    }
  })

  test('POST /products creates a product and returns 201', async ({ request }) => {
    const res = await request.post('/products', { data: { title: 'New', price: 9.99 } })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.id).toBe(21)
    expect(body.title).toBe('New')
    const valid = validateCreatedProduct(body)
    expectContractValid(valid, ajv.errorsText(validateCreatedProduct.errors), 'created product contract')
  })

  test('GET /users returns 200 and an array', async ({ request }) => {
    const res = await request.get('/users')
    expect(res.status()).toBe(200)
    const users = await res.json()
    expect(Array.isArray(users)).toBe(true)
    for (const user of users) {
      const valid = validateUser(user)
      expectContractValid(valid, ajv.errorsText(validateUser.errors), 'user contract')
    }
  })

  test('GET /users/2 returns Bob', async ({ request }) => {
    const user = await (await request.get('/users/2')).json()
    expect(user.name).toBe('Bob')
    const valid = validateUser(user)
    expectContractValid(valid, ajv.errorsText(validateUser.errors), 'single user contract')
  })

  test('GET /users/999 returns 404', async ({ request }) => {
    const res = await request.get('/users/999')
    expect(res.status()).toBe(404)
    const body = await res.json()
    const valid = validateError(body)
    expectContractValid(valid, ajv.errorsText(validateError.errors), 'user 404 contract')
  })

  test('POST /login with valid credentials returns a token', async ({ request }) => {
    const res = await request.post('/login', { data: { email: 'a@b.com', password: 'pw' } })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.token).toBeTruthy()
    const valid = validateToken(body)
    expectContractValid(valid, ajv.errorsText(validateToken.errors), 'login token contract')
  })

  test('POST /login missing password returns 400', async ({ request }) => {
    const res = await request.post('/login', { data: { email: 'a@b.com' } })
    expect(res.status()).toBe(400)
    const body = await res.json()
    const valid = validateError(body)
    expectContractValid(valid, ajv.errorsText(validateError.errors), 'login error contract')
  })

  test('GET /posts returns 100 posts', async ({ request }) => {
    const posts = await (await request.get('/posts')).json()
    expect(posts).toHaveLength(100)
    for (const post of posts) {
      const valid = validatePost(post)
      expectContractValid(valid, ajv.errorsText(validatePost.errors), 'post contract')
    }
  })

  test('PUT /posts/1 updates the post', async ({ request }) => {
    const res = await request.put('/posts/1', { data: { title: 'Updated' } })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.title).toBe('Updated')
    const valid = validateUpdatedPost(body)
    expectContractValid(valid, ajv.errorsText(validateUpdatedPost.errors), 'updated post contract')
  })

  test('DELETE /posts/1 returns 200', async ({ request }) => {
    const res = await request.delete('/posts/1')
    expect(res.status()).toBe(200)
    const body = await res.json()
    const valid = validateEmptyObject(body)
    expectContractValid(valid, ajv.errorsText(validateEmptyObject.errors), 'delete response contract')
  })
})
