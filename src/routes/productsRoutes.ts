import express from "express"
import {
  getProducts,
  createProduct,
  deleteProduct,
  updateProduct, // new 
} from "../controllers/productsController"

const router = express.Router()

// === Existing routes ===
router.get("/", getProducts)
router.post("/", createProduct)

// === New route: UPDATE product ===
router.put("/:id", updateProduct) //  added line

// === New route: DELETE product ===
router.delete("/:id", deleteProduct)

export default router
