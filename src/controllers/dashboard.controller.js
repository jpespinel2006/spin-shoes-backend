import { pool } from "../db.js";
import axios from "axios";

export const getDashboard = async (req, res) => {
  try {
    // 🔢 pedidos recientes
    const pedidos = await pool.query("SELECT * FROM public.orders ORDER BY id DESC LIMIT 5");

    // 📊 conteo estados
    const activos = await pool.query("SELECT COUNT(*) FROM public.orders WHERE status='activo'");
    const produccion = await pool.query("SELECT COUNT(*) FROM public.orders WHERE status='produccion'");
    const completados = await pool.query("SELECT COUNT(*) FROM public.orders WHERE status='completado'");

    // 🤖 traer grafica desde Python
const py = await axios.get("http://127.0.0.1:8000/analytics");
    // 🧠 ALERTAS INTELIGENTES
    let alerts = [];

    // 🚨 pedidos grandes
    const grandes = await pool.query("SELECT * FROM public.orders WHERE cantidad > 50");
    if (grandes.rows.length > 0) {
      alerts.push({
        tipo: "warning",
        mensaje: `Hay ${grandes.rows.length} pedidos grandes`
      });
    }

    // ⚠️ pedidos en producción
    if (produccion.rows[0].count > 0) {
      alerts.push({
        tipo: "info",
        mensaje: `Hay ${produccion.rows[0].count} pedidos en producción`
      });
    }

    // ❗ pedidos activos (muchos)
    if (activos.rows[0].count > 10) {
      alerts.push({
        tipo: "danger",
        mensaje: "Demasiados pedidos activos, posible retraso"
      });
    }

    res.json({
      activos: activos.rows[0].count,
      produccion: produccion.rows[0].count,
      completados: completados.rows[0].count,
      pedidos: pedidos.rows,
      chart: py.data.chart,
      alerts
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error dashboard" });
  }
};