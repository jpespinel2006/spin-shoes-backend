import jwt from "jsonwebtoken";

// ── Verifica que el request traiga un JWT válido ──────────────────────────────
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ message: "Token requerido" });

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, rol }
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

// ── Fábrica de middleware: exige que el usuario tenga uno de los roles dados ───
// Uso: requireRol("admin", "superadmin")
export const requireRol = (...roles) => (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ message: "No autenticado" });

  if (!roles.includes(req.user.rol))
    return res.status(403).json({ message: "Acceso denegado: permisos insuficientes" });

  next();
};