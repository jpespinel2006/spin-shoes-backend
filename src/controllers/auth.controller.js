import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { pool } from "../db.js";

export const register = async (req, res) => {
  const { nombre, empresa, telefono, email, ciudad, direccion, password } = req.body;

  try {
    // 🔐 encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO public.users (nombre, empresa, telefono, email, ciudad, direccion, password)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [nombre, empresa, telefono, email, ciudad, direccion, hashedPassword]
    );

    res.json({
      message: "Usuario creado correctamente",
      user: result.rows[0],
    });

  } catch (error) {
    console.error("🔥 ERROR REGISTER:", error);

    if (error.code === "23505") {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("🔵 LOGIN EMAIL:", email);
  console.log("🔵 LOGIN PASSWORD:", password);
  try {
    // 🔍 Buscar usuario en la BD
    const result = await pool.query(
      "SELECT * FROM public.users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Usuario no existe" });
    }

    const user = result.rows[0];
    console.log("🟢 USER EN BD:", user);

    //Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🟡 PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // 🎟️ Crear token — incluye rol para control de acceso en frontend y backend
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};