import { pool } from "../db.js";

export const getReports = async (req, res) => {
  try {
    // Total de pedidos por estado
    const porEstado = await pool.query(`
      SELECT status, COUNT(*) as total
      FROM public.orders
      GROUP BY status
    `);

    // Top 5 clientes con más pedidos
    const topClientes = await pool.query(`
      SELECT cliente, COUNT(*) as total_pedidos, SUM(cantidad) as total_unidades
      FROM public.orders
      GROUP BY cliente
      ORDER BY total_pedidos DESC
      LIMIT 5
    `);

    // Top 5 modelos más pedidos
    const topModelos = await pool.query(`
      SELECT modelo, COUNT(*) as veces_pedido, SUM(cantidad) as total_unidades
      FROM public.orders
      GROUP BY modelo
      ORDER BY total_unidades DESC
      LIMIT 5
    `);

    // Pedidos por mes (últimos 6 meses)
    const porMes = await pool.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as mes, COUNT(*) as total
      FROM public.orders
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY mes
      ORDER BY mes ASC
    `);

    // Resumen general
    const resumen = await pool.query(`
      SELECT
        COUNT(*) as total_pedidos,
        SUM(cantidad) as total_unidades,
        COUNT(DISTINCT cliente) as total_clientes
      FROM public.orders
    `);

    res.json({
      porEstado: porEstado.rows,
      topClientes: topClientes.rows,
      topModelos: topModelos.rows,
      porMes: porMes.rows,
      resumen: resumen.rows[0],
    });

  } catch (error) {
    console.error("❌ Error al generar reporte:", error);
    res.status(500).json({ message: "Error al generar reporte" });
  }
};