import { Router } from "express";
import { getUsers, changeRol, deleteUser, createUser } from "../controllers/admin.controller.js";
import { verifyToken, requireRol } from "../middleware/auth.middleware.js";

const router = Router();

// Todas las rutas de admin requieren token válido + rol admin o superadmin
router.use(verifyToken, requireRol("admin", "superadmin"));

router.get("/users",           getUsers);
router.post("/users",          createUser);
router.put("/users/:id/rol",   changeRol);
router.delete("/users/:id",    deleteUser);

export default router;