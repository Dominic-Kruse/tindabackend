import express from "express"
import {
  getProducts,
  createProduct,
  deleteProduct // added delete endpoint
} from "../controllers/productsController"

const router = express.Router()

// === Existing routes ===
router.get("/", getProducts)
router.post("/", createProduct)

// === New route: DELETE product ===
router.delete("/:id", deleteProduct)

export default router
