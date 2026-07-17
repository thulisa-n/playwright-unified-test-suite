// course-assets/playwright-project-pack/mock-api/server.mjs
// Zero-dependency mock REST API for the Playwright Project Pack API tests.
// Deterministic and offline: every response is computed from in-memory data.
import { createServer } from 'node:http'

const PORT = Number(process.env.MOCK_API_PORT) || 3100

const products = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `Product ${i + 1}`,
  price: Number(((i + 1) * 3.5).toFixed(2)),
  category: i % 2 === 0 ? 'electronics' : 'clothing',
  description: `Description for product ${i + 1}`,
}))
const categories = ['electronics', 'clothing']
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
]
const posts = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  title: `Post ${i + 1}`,
  body: `Body of post ${i + 1}`,
  userId: (i % 2) + 1,
}))

function send(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  })
  res.end(payload)
}

async function readJson(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return {}
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const path = url.pathname
  const method = req.method || 'GET'

  if (path === '/health') return send(res, 200, { status: 'ok' })

  // Products
  if (path === '/products' && method === 'GET') return send(res, 200, products)
  if (path === '/products/categories' && method === 'GET') return send(res, 200, categories)
  if (path === '/products' && method === 'POST') {
    const body = await readJson(req)
    return send(res, 201, { id: products.length + 1, ...body })
  }
  const productMatch = path.match(/^\/products\/(\d+)$/)
  if (productMatch && method === 'GET') {
    const product = products.find((p) => p.id === Number(productMatch[1]))
    return product ? send(res, 200, product) : send(res, 404, { error: 'Not found' })
  }

  // Users
  if (path === '/users' && method === 'GET') return send(res, 200, users)
  const userMatch = path.match(/^\/users\/(\d+)$/)
  if (userMatch && method === 'GET') {
    const user = users.find((u) => u.id === Number(userMatch[1]))
    return user ? send(res, 200, user) : send(res, 404, { error: 'Not found' })
  }

  // Auth
  if (path === '/login' && method === 'POST') {
    const body = await readJson(req)
    if (!body.email || !body.password) return send(res, 400, { error: 'Missing credentials' })
    return send(res, 200, { token: 'mock-token-abc123' })
  }

  // Posts
  if (path === '/posts' && method === 'GET') return send(res, 200, posts)
  if (path === '/posts' && method === 'POST') {
    const body = await readJson(req)
    return send(res, 201, { id: posts.length + 1, ...body })
  }
  const postMatch = path.match(/^\/posts\/(\d+)$/)
  if (postMatch) {
    const id = Number(postMatch[1])
    if (method === 'GET') {
      const post = posts.find((p) => p.id === id)
      return post ? send(res, 200, post) : send(res, 404, { error: 'Not found' })
    }
    if (method === 'PUT') {
      const body = await readJson(req)
      return send(res, 200, { id, ...body })
    }
    if (method === 'DELETE') return send(res, 200, {})
  }

  return send(res, 404, { error: 'Not found' })
})

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Mock API listening on http://localhost:${PORT}`)
})
