import { Router } from "express";
import { getAllStores, openStore, closeStore } from "../controllers/storesController.js";
import { authMiddleware, requireRole } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, getAllStores);
router.patch("/:id/open", authMiddleware, requireRole("store"), openStore);
router.patch("/:id/close", authMiddleware, requireRole("store"), closeStore);

export default router;