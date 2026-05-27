import { pool } from "../db.js";

export const getDashboard = async (req, res) => {
  try {
    const pedidos     = await pool.query("SELECT * FROM public.orders ORDER BY id DESC LIMIT 5");
    const activos     = await pool.query("SELECT COUNT(*) FROM public.orders WHERE status='activo'");
    const produccion  = await pool.query("SELECT COUNT(*) FROM public.orders WHERE status='produccion'");
    const completados = await pool.query("SELECT COUNT(*) FROM public.orders WHERE status='completado'");

    // Estadísticas de pago
    const pagados    = await pool.query("SELECT COUNT(*) FROM public.orders WHERE pago_estado='pagado'");
    const abonos     = await pool.query("SELECT COUNT(*) FROM public.orders WHERE pago_estado='abono'");
    const pendientes = await pool.query("SELECT COUNT(*) FROM public.orders WHERE pago_estado='pendiente' OR pago_estado IS NULL");

    // Totales financieros
    const totalRecaudado  = await pool.query("SELECT COALESCE(SUM(pago_monto), 0) as total FROM public.orders WHERE pago_estado IN ('pagado', 'abono')");
    const totalPagado     = await pool.query("SELECT COALESCE(SUM(pago_monto), 0) as total FROM public.orders WHERE pago_estado='pagado'");
    const totalAbono      = await pool.query("SELECT COALESCE(SUM(pago_monto), 0) as total FROM public.orders WHERE pago_estado='abono'");
    const totalPendiente  = await pool.query("SELECT COALESCE(SUM(precio_total - pago_monto), 0) as total FROM public.orders WHERE pago_estado != 'pagado' AND precio_total > 0");

    let alerts = [];
    const grandes = await pool.query("SELECT * FROM public.orders WHERE cantidad > 50");
    if (grandes.rows.length > 0) {
      alerts.push({ tipo: "warning", mensaje: `Hay ${grandes.rows.length} pedidos grandes` });
    }
    if (parseInt(produccion.rows[0].count) > 0) {
      alerts.push({ tipo: "info", mensaje: `Hay ${produccion.rows[0].count} pedidos en producción` });
    }
    if (parseInt(activos.rows[0].count) > 10) {
      alerts.push({ tipo: "danger", mensaje: "Demasiados pedidos activos, posible retraso" });
    }
    if (parseInt(pendientes.rows[0].count) > 5) {
      alerts.push({ tipo: "warning", mensaje: `Hay ${pendientes.rows[0].count} pedidos con pago pendiente` });
    }

    res.json({
      activos:     activos.rows[0].count,
      produccion:  produccion.rows[0].count,
      completados: completados.rows[0].count,
      pedidos:     pedidos.rows,
      chart:       null,
      alerts,
      pagos: {
        pagados:          parseInt(pagados.rows[0].count),
        abonos:           parseInt(abonos.rows[0].count),
        pendientes:       parseInt(pendientes.rows[0].count),
        totalRecaudado:   parseFloat(totalRecaudado.rows[0].total),
        totalPagado:      parseFloat(totalPagado.rows[0].total),
        totalAbono:       parseFloat(totalAbono.rows[0].total),
        totalPorCobrar:   parseFloat(totalPendiente.rows[0].total),
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error dashboard" });
  }
};