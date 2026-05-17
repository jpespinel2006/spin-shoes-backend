import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import clientsRoutes from "./routes/clients.routes.js";
import catalogRoutes from "./routes/catalog.routes.js";
import productionRoutes from "./routes/production.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import adminRoutes from "./routes/Admin.routes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Servir imágenes subidas
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Servir frontend compilado
app.use(express.static(path.join(__dirname, "..", "public")));

// Rutas API
app.use("/api/auth",       authRoutes);
app.use("/api/orders",     ordersRoutes);
app.use("/api/dashboard",  dashboardRoutes);
app.use("/api/ai",         aiRoutes);
app.use("/api/clients",    clientsRoutes);
app.use("/api/catalog",    catalogRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/reports",    reportsRoutes);
app.use("/api/admin",      adminRoutes);

// Cualquier otra ruta devuelve el frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(process.env.PORT || 4000, () => {
  console.log("Servidor corriendo en puerto 4000");
});