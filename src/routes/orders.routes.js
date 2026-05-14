import { Router } from "express";
import { getOrders, createOrder, deleteOrder } from "../controllers/orders.controller.js";
import { updateOrder } from "../controllers/orders.controller.js";

const router = Router();

router.get("/", getOrders);
router.post("/", createOrder);
router.delete("/:id", deleteOrder);
router.put("/:id", updateOrder);

export default router;