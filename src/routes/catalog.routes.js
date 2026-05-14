import { Router } from "express";
import { getCatalog, createProduct, updateProduct, deleteProduct, uploadImagenColor } from "../controllers/catalog.controller.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/", getCatalog);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

// Subir imagen por color: POST /api/catalog/:id/imagen?color=negro
router.post("/:id/imagen", upload.single("imagen"), uploadImagenColor);

export default router;
