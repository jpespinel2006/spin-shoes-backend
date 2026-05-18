 import { Router } from "express";
import { getCatalog, createProduct, updateProduct, deleteProduct, uploadImagenColor } from "../controllers/catalog.controller.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/", getCatalog);
router.post("/", createProduct);

// Subir imagen por color ANTES de las rutas genéricas /:id
router.post("/:id/imagen", upload.single("imagen"), uploadImagenColor);

router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;