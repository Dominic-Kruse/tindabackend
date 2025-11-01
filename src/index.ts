import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { db } from './db'
import { users, vendors, buyers, stalls, stall_items, conversations, messages, images, sessions, revoked_tokens, reviews, shopping_carts, line_items, orders, payments, sales } from './db/schema'
import { eq } from 'drizzle-orm'

const app = express()
const port = process.env.PORT || 3001

app.use(cors()) // enable CORS for all routes
app.use(express.json()) // 



app.get('/api/stall_items', async (req, res) => {
    try {
        const allStallItems = await db.query.stall_items.findMany()
        res.json(allStallItems)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch stall items'})
    }
})

app.get('/api/users', async (req, res) => {
    try {
        const allUsers = await db.query.users.findMany()
        res.json(allUsers)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch users'})
    }
})

app.get('/api/vendors', async (req, res) => {
    try {
        const allVendors = await db.query.vendors.findMany()
        res.json(allVendors)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch vendors'})
    }
})

app.get('/api/buyers', async (req, res) => {
    try {
        const allBuyers = await db.query.buyers.findMany()
        res.json(allBuyers)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch buyers'})
    }
})

app.get('/api/stalls', async (req, res) => {
    try {
        const allStalls = await db.query.stalls.findMany()
        res.json(allStalls)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch stalls'})
    }
})

app.get('/api/conversations', async (req, res) => {
    try {
        const allConversations = await db.query.conversations.findMany()
        res.json(allConversations)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch conversations'})
    }
})

app.get('/api/messages', async (req, res) => {
    try {
        const allMessages = await db.query.messages.findMany()
        res.json(allMessages)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch messages'})
    }
})

app.get('/api/images', async (req, res) => {
    try {
        const allImages = await db.query.images.findMany()
        res.json(allImages)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch images'})
    }
})

app.get('/api/sessions', async (req, res) => {
    try {
        const allSessions = await db.query.sessions.findMany()
        res.json(allSessions)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch sessions'})
    }
})

app.get('/api/revoked_tokens', async (req, res) => {
    try {
        const allRevokedTokens = await db.query.revoked_tokens.findMany()
        res.json(allRevokedTokens)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch revoked tokens'})
    }
})

app.get('/api/reviews', async (req, res) => {
    try {
        const allReviews = await db.query.reviews.findMany()
        res.json(allReviews)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch reviews'})
    }
})

app.get('/api/shopping_carts', async (req, res) => {
    try {
        const allShoppingCarts = await db.query.shopping_carts.findMany()
        res.json(allShoppingCarts)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch shopping carts'})
    }
})

app.get('/api/line_items', async (req, res) => {
    try {
        const allLineItems = await db.query.line_items.findMany()
        res.json(allLineItems)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch line items'})
    }
})

app.get('/api/orders', async (req, res) => {
    try {
        const allOrders = await db.query.orders.findMany()
        res.json(allOrders)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch orders'})
    }
})

app.get('/api/payments', async (req, res) => {
    try {
        const allPayments = await db.query.payments.findMany()
        res.json(allPayments)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch payments'})
    }
})

app.get('/api/sales', async (req, res) => {
    try {
        const allSales = await db.query.sales.findMany()
        res.json(allSales)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch sales'})
    }
})

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`)
})