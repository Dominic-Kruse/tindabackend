import { Request, Response } from 'express'
import { db } from '../db'
import { users, vendors, buyers, stalls } from '../db/schema' // 🧩 includes stalls
import { eq } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import jwt, { SignOptions } from 'jsonwebtoken'
import { Sign } from 'crypto'

function createToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  } as SignOptions)
}

export async function registerUser(req: Request, res: Response) {
  try {
    const { full_name, email, password, role } = req.body

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing Fields' })
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const [newUser] = await db.insert(users).values({
      full_name,
      email,
      password_hash: hashed,
      role,
    }).returning()

    const validRoles = ['vendor', 'buyer']
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password too short' })
    }

    if (role === 'vendor') {
      await db.insert(vendors).values({ user_id: newUser!.user_id })

      //  ADDED: automatically create a default stall for the vendor
      await db.insert(stalls).values({
        user_id: newUser!.user_id,
        stall_name: `${full_name}'s Stall`,
        stall_description: `Default stall for ${full_name}`,
        category: 'General',
        stall_city: 'Unknown',
        stall_state: 'Unknown',
        stall_address: 'Unknown',
      })
    } else if (role === 'buyer') {
      await db.insert(buyers).values({ user_id: newUser!.user_id })
    }

    const token = createToken({ id: newUser?.user_id, email, role })

    res.status(201).json({
      message: 'User registered successfully!',
      token,
      user: { id: newUser?.user_id, full_name, email, role }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password, role } = req.body

    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    })

    if (!user) {
      return res.status(400).json({ message: 'User not found' })
    }

    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return res.status(401).json({ message: 'Invalid password' })
    }

    const token = createToken({ id: user.user_id, email: user.email, role: user.role })

    // === Include stall info if vendor ===
    let stallData = null
    if (user.role === 'vendor') {
      try {
        const vendorRecord = await db.query.vendors.findFirst({
          where: eq(vendors.user_id, user.user_id),
        })

        if (vendorRecord) {
          let stallRecord = await db.query.stalls.findFirst({
            where: eq(stalls.user_id, user.user_id),
          })

          //  ADDED: auto-create stall on login if somehow missing
          if (!stallRecord) {
            const [newStall] = await db.insert(stalls).values({
              user_id: user.user_id,
              stall_name: `${user.full_name}'s Stall`,
              stall_description: `Default stall for ${user.full_name}`,
              category: 'General',
              stall_city: 'Unknown',
              stall_state: 'Unknown',
              stall_address: 'Unknown',
            }).returning()
            stallRecord = newStall
          }

          if (stallRecord) {
            stallData = {
              stall_id: stallRecord.stall_id,
              stall_name: stallRecord.stall_name,
            }
          }
        }
      } catch (err) {
        console.error("Error fetching stall data for vendor:", err)
      }
    }

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        stall: stallData, // now guaranteed to exist
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
