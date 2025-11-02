// CREATE PRODUCT LISTING

import express from "express";
import { db } from "../db";
import { stall_items } from "../db/schema";
import { eq } from "drizzle-orm";

const router = express.Router();

// POST /items
// Creates a new product listing for a vendor's stall
router.post("/items", async (req, res) => {
  try {
    const { stall_id, item_name, price, item_description, item_stocks } = req.body;

    // Validation
    if (!stall_id || !item_name || !price) {
      return res
        .status(400)
        .json({ error: "stall_id, item_name, and price are required." });
    }

    // Convert and clean values
    const stocks = item_stocks ? parseInt(item_stocks) : 0;
    const priceDecimal =
      typeof price === "number" ? price.toString() : String(price);

    // Insert new product into stall_items table
    const inserted = await db
      .insert(stall_items)
      .values({
        stall_id: Number(stall_id),
        item_name,
        item_description: item_description || null,
        price: priceDecimal,
        item_stocks: stocks,
        in_stock: stocks > 0,
      })
      .returning({ item_id: stall_items.item_id });

    // Success
    return res.status(201).json({
      message: "Product created successfully",
      product: inserted[0],
    });
  } catch (err: any) {
    console.error("Error creating product:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message || err,
    });
  }
});

export default router;
