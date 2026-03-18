import { Router } from "express";
import { getProductsByStore, createProduct, deleteProduct } from "../controllers/productsController.js";
import { authMiddleware, requireRole } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/store/:storeId", authMiddleware, getProductsByStore);
router.post("/", authMiddleware, requireRole("store"), createProduct);
router.delete("/:id", authMiddleware, requireRole("store"), deleteProduct);

export default router;