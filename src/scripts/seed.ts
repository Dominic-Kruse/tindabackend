// src/seed.ts
import 'dotenv/config'
import { db } from '../db'
import * as schema from '../db/schema'
import { eq } from 'drizzle-orm'

async function seed() {
  console.log('🌱 Seeding database...')

  // 1️⃣ Clear existing data (optional for dev)
  await db.delete(schema.sales)
  await db.delete(schema.payments)
  await db.delete(schema.orders)
  await db.delete(schema.line_items)
  await db.delete(schema.shopping_carts)
  await db.delete(schema.messages)
  await db.delete(schema.conversations)
  await db.delete(schema.stall_items)
  await db.delete(schema.stalls)
  await db.delete(schema.buyers)
  await db.delete(schema.vendors)
  await db.delete(schema.users)

  // 2️⃣ Create sample users
  const [vendorUser, buyerUser] = await db
    .insert(schema.users)
    .values([
      {
        email: 'vendor@example.com',
        full_name: 'Vendor User',
        password_hash: 'hashed_password_123',
        role: 'vendor',
      },
      {
        email: 'buyer@example.com',
        full_name: 'Buyer User',
        password_hash: 'hashed_password_456',
        role: 'buyer',
      },
    ])
    .returning({ user_id: schema.users.user_id })

  // 3️⃣ Insert vendor & buyer profiles
  await db.insert(schema.vendors).values({
    user_id: vendorUser!.user_id,
    business_name: 'Dom’s Fruits',
    vendor_contact: '09123456789',
    vendor_description: 'Fresh fruits and veggies.',
  })

  await db.insert(schema.buyers).values({
    user_id: buyerUser!.user_id,
    buyer_address: '123 Mango Street',
    buyer_city: 'Manila',
    buyer_country: 'Philippines',
  })

  // 4️⃣ Create a stall
  const [stall] = await db
    .insert(schema.stalls)
    .values({
      user_id: vendorUser!.user_id,
      stall_name: 'Dom’s Fruit Stall',
      stall_description: 'Locally sourced mangoes and bananas.',
      category: 'Fruits',
    })
    .returning({ stall_id: schema.stalls.stall_id })

  // 5️⃣ Add items
  const [item1, item2] = await db
    .insert(schema.stall_items)
    .values([
      {
        stall_id: stall!.stall_id,
        item_name: 'Mango',
        price: '50.00',
        item_stocks: 100,
        in_stock: true,
      },
      {
        stall_id: stall!.stall_id,
        item_name: 'Banana',
        price: '20.00',
        item_stocks: 80,
        in_stock: true,
      },
    ])
    .returning({ item_id: schema.stall_items.item_id })

  // 6️⃣ Conversation + messages
  const [conv] = await db
    .insert(schema.conversations)
    .values({
      buyer_id: buyerUser!.user_id,
      vendor_id: vendorUser!.user_id,
      stall_id: stall!.stall_id,
    })
    .returning({ conversation_id: schema.conversations.conversation_id })

  await db.insert(schema.messages).values([
    {
      conversation_id: conv!.conversation_id,
      sender_user_id: buyerUser!.user_id,
      content: 'Hi, are mangoes available?',
    },
    {
      conversation_id: conv!.conversation_id,
      sender_user_id: vendorUser!.user_id,
      content: 'Yes! Fresh from the farm today.',
    },
  ])

  console.log('✅ Seed complete!')
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error seeding:', err)
    process.exit(1)
  })
