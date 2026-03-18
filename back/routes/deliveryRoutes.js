import { Router } from "express";
import { getAvailableOrders, getAcceptedOrders, acceptOrder, declineOrder } from "../controllers/deliveryController.js";
import { authMiddleware, requireRole } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/orders/available", authMiddleware, requireRole("delivery"), getAvailableOrders);
router.get("/orders/accepted", authMiddleware, requireRole("delivery"), getAcceptedOrders);
router.post("/orders/:id/accept", authMiddleware, requireRole("delivery"), acceptOrder);
router.post("/orders/:id/decline", authMiddleware, requireRole("delivery"), declineOrder);

export default router;