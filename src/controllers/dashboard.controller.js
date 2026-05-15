import { pool } from "../db.js";

export const getDashboard = async (req, res) => {
  try {
    const pedidos = await pool.query("SELECT * FROM public.orders ORDER BY id DESC LIMIT 5");
    const activos = await pool.query("SELECT COUNT(*) FROM public.orders WHERE status='activo'");
    const produccion = await pool.query("SELECT COUNT(*) FROM public.orders WHERE status='produccion'");
    const completados = await pool.query("SELECT COUNT(*) FROM public.orders WHERE status='completado'");

    let alerts = [];

    const grandes = await pool.query("SELECT * FROM public.orders WHERE cantidad > 50");
    if (grandes.rows.length > 0) {
      alerts.push({ tipo: "warning", mensaje: `Hay ${grandes.rows.length} pedidos grandes` });
    }
    if (produccion.rows[0].count > 0) {
      alerts.push({ tipo: "info", mensaje: `Hay ${produccion.rows[0].count} pedidos en producción` });
    }
    if (activos.rows[0].count > 10) {
      alerts.push({ tipo: "danger", mensaje: "Demasiados pedidos activos, posible retraso" });
    }

    res.json({
      activos: activos.rows[0].count,
      produccion: produccion.rows[0].count,
      completados: completados.rows[0].count,
      pedidos: pedidos.rows,
      chart: null,
      alerts
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error dashboard" });
  }
};