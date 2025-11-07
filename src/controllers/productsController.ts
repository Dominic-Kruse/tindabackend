import { Request, Response } from "express"
import { db } from "../db"
import { stall_items, images } from "../db/schema"
import { eq, and } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

// ========== GET PRODUCTS ==========
export async function getProducts(req: Request, res: Response) {
  try {
    const { stall_id } = req.query
    const productImages = alias(images, "product_images")

    let query = db
      .select({
        item_id: stall_items.item_id,
        item_name: stall_items.item_name,
        item_description: stall_items.item_description,
        price: stall_items.price,
        item_stocks: stall_items.item_stocks,
        in_stock: stall_items.in_stock,
        stall_id: stall_items.stall_id,
        image_url: productImages.image_url,
        category: stall_items.category,
      })
      .from(stall_items)
      .leftJoin(
        productImages,
        and(
          eq(stall_items.item_id, productImages.item_id),
          eq(productImages.image_type, "thumbnail")
        )
      )

    if (stall_id) {
      // @ts-ignore drizzle typing limitation
      query = query.where(eq(stall_items.stall_id, stall_id))
    }

    const products = await query
    res.status(200).json(products)
  } catch (err) {
    console.error("Error fetching products:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

// ========== CREATE PRODUCT ==========
export async function createProduct(req: Request, res: Response) {
  try {
    const {
      stall_id,
      item_name,
      price,
      item_description,
      item_stocks,
      image_url,
      category,
    } = req.body

    if (!stall_id || !item_name || !price) {
      return res.status(400).json({ error: "stall_id, item_name, and price are required." })
    }

    const stocks = item_stocks ? parseInt(item_stocks) : 0
    const priceDecimal = typeof price === "number" ? price.toString() : String(price)

    const [insertedItem] = await db
      .insert(stall_items)
      .values({
        stall_id: Number(stall_id),
        item_name,
        item_description: item_description || null,
        price: priceDecimal,
        item_stocks: stocks,
        in_stock: stocks > 0,
        category: category || null,
      })
      .returning({ item_id: stall_items.item_id })

    if (!insertedItem) throw new Error("Failed to insert product.")

    if (image_url) {
      await db.insert(images).values({
        image_url,
        entity_type: "item",
        image_type: "thumbnail",
        item_id: insertedItem.item_id,
      })
    }

    res.status(201).json({
      message: "Product created successfully",
      product_id: insertedItem.item_id,
    })
  } catch (err: any) {
    console.error("Error creating product:", err)
    res.status(500).json({ error: "Internal server error", details: err.message || err })
  }
}

// ========== UPDATE PRODUCT ==========
export async function updateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { item_name, item_description, price, item_stocks, image_url, category } = req.body

    const [updated] = await db
      .update(stall_items)
      .set({
        item_name,
        item_description,
        price: price ? String(price) : undefined,
        item_stocks: item_stocks ? parseInt(item_stocks) : undefined,
        in_stock: item_stocks ? parseInt(item_stocks) > 0 : undefined,
        category: category || null,
      })
      .where(eq(stall_items.item_id, Number(id)))
      .returning({ item_id: stall_items.item_id })

    if (!updated) return res.status(404).json({ error: "Product not found" })

    if (image_url) {
      const existingImage = await db.query.images.findFirst({
        where: and(eq(images.item_id, Number(id)), eq(images.image_type, "thumbnail")),
      })
      if (existingImage) {
        await db.update(images).set({ image_url }).where(eq(images.image_id, existingImage.image_id))
      } else {
        await db.insert(images).values({
          item_id: Number(id),
          image_url,
          image_type: "thumbnail",
          entity_type: "item",
        })
      }
    }

    res.status(200).json({ message: "Product updated successfully", item_id: updated.item_id })
  } catch (err) {
    console.error("Error updating product:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

// ========== DELETE PRODUCT ==========
export async function deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params // id from route

    if (!id) {
      return res.status(400).json({ error: "Missing product ID" })
    }

    const productId = Number(id)
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" })
    }

    // Check if the product exists
    const existing = await db.query.stall_items.findFirst({
      where: eq(stall_items.item_id, productId),
    })

    if (!existing) {
      return res.status(404).json({ error: "Product not found" })
    }

    // Delete related images first
    await db.delete(images).where(eq(images.item_id, productId))

    // Delete the product itself
    await db.delete(stall_items).where(eq(stall_items.item_id, productId))

    res.status(200).json({ message: "Product deleted successfully" })
  } catch (err) {
    console.error("Error deleting product:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

