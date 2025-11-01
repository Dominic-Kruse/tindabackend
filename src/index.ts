import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { db } from './db'
import * as schema from './db/schema'
import { eq } from 'drizzle-orm'

const app = express()
const port = process.env.PORT || 3001

app.use(cors()) 
app.use(express.json())

const tables = [
  'users', 'vendors', 'buyers', 'stalls', 'stall_items', 'conversations',
  'messages', 'images', 'sessions', 'revoked_tokens', 'reviews',
  'shopping_carts', 'line_items', 'orders', 'payments', 'sales'
] as const

tables.forEach((table) => {
  app.get(`/api/${table}`, async (_req, res) => {
    try {
      // @ts-ignore dynamic key access
      const rows = await db.query[table].findMany()
      res.json(rows)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: `Failed to fetch ${table}` })
    }
  })
})

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`)
})