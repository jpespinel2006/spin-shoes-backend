import express from "express";
import { askAI, reindexAI } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/", askAI);
router.post("/reindex", reindexAI);

export default router;