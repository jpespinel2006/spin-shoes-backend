import { Router } from "express";
import { getProduction, createProduction, updateProductionStatus } from "../controllers/production.controller.js";

const router = Router();

router.get("/", getProduction);
router.post("/", createProduction);
router.put("/:id", updateProductionStatus);

export default router;