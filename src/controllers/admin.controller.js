import bcrypt from "bcrypt";
import { pool } from "../db.js";

// GET /api/admin/users — lista todos los usuarios (sin password)
export const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nombre, empresa, telefono, email, ciudad, direccion, rol, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("ERROR getUsers:", error);
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/users/:id/rol — cambia el rol de un usuario
// Solo superadmin puede asignar/quitar superadmin
export const changeRol = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  const rolesPermitidos = ["user", "admin", "superadmin"];
  if (!rolesPermitidos.includes(rol)) {
    return res.status(400).json({ message: "Rol inválido" });
  }

  // Solo superadmin puede otorgar/quitar superadmin
  if (rol === "superadmin" && req.user.rol !== "superadmin") {
    return res.status(403).json({ message: "Solo un superadmin puede otorgar ese rol" });
  }

  // Evitar que un admin se degrade a sí mismo accidentalmente
  if (Number(id) === req.user.id && rol !== req.user.rol) {
    return res.status(400).json({ message: "No puedes cambiar tu propio rol" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET rol = $1 WHERE id = $2 RETURNING id, nombre, email, rol",
      [rol, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: "Rol actualizado", user: result.rows[0] });
  } catch (error) {
    console.error("ERROR changeRol:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/users/:id — elimina un usuario
// Superadmin puede borrar cualquiera; admin solo puede borrar usuarios con rol 'user'
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (Number(id) === req.user.id) {
    return res.status(400).json({ message: "No puedes eliminarte a ti mismo" });
  }

  try {
    // Verificar rol del objetivo antes de borrar
    const target = await pool.query("SELECT rol FROM users WHERE id = $1", [id]);
    if (target.rows.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    if (req.user.rol === "admin" && target.rows[0].rol !== "user") {
      return res.status(403).json({ message: "Un admin solo puede eliminar usuarios con rol 'user'" });
    }

    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error("ERROR deleteUser:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/admin/users — crea un usuario con rol específico (solo admin/superadmin)
export const createUser = async (req, res) => {
  const { nombre, empresa, telefono, email, ciudad, direccion, password, rol = "user" } = req.body;

  if (rol === "superadmin" && req.user.rol !== "superadmin") {
    return res.status(403).json({ message: "Solo un superadmin puede crear otro superadmin" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (nombre, empresa, telefono, email, ciudad, direccion, password, rol)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, nombre, email, rol`,
      [nombre, empresa, telefono, email, ciudad, direccion, hashedPassword, rol]
    );
    res.status(201).json({ message: "Usuario creado", user: result.rows[0] });
  } catch (error) {
    if (error.code === "23505")
      return res.status(400).json({ message: "El email ya está registrado" });
    res.status(500).json({ message: error.message });
  }
};