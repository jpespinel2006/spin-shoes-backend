import { pool } from "../db.js";

// Obtener todos los registros de producción con datos del pedido
export const getProduction = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, o.cliente, o.modelo, o.cantidad
      FROM public.production p
      JOIN orders o ON p.order_id = o.id
      ORDER BY p.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener producción:", error);
    res.status(500).json({ message: "Error al obtener producción" });
  }
};

// Crear registro de producción para un pedido
export const createProduction = async (req, res) => {
  const { order_id, responsable, fecha_estimada, notas } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO public.production (order_id, estado, responsable, fecha_estimada, notas)
       VALUES ($1, 'CREADO', $2, $3, $4) RETURNING *`,
      [order_id, responsable, fecha_estimada || null, notas || null]
    );

    // Actualizar estado del pedido a "produccion"
    await pool.query(
      "UPDATE public.orders SET status='produccion' WHERE id=$1",
      [order_id]
    );

    res.json({ message: "Registro de producción creado", production: result.rows[0] });
  } catch (error) {
    console.error("❌ Error al crear producción:", error);
    res.status(500).json({ message: "Error al crear registro de producción" });
  }
};

// Cambiar estado de producción
export const updateProductionStatus = async (req, res) => {
  const { id } = req.params;
  const { estado, notas } = req.body;

  // Estados válidos
  const estadosValidos = ["CREADO", "EN_PRODUCCION", "LISTO", "DESPACHADO", "ENTREGADO"];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ message: "Estado no válido" });
  }

  try {
    // Actualizar producción
    const result = await pool.query(
      "UPDATE public.production SET estado=$1, notas=$2 WHERE id=$3 RETURNING order_id",
      [estado, notas, id]
    );

    // Si está entregado, actualizar el pedido a "completado"
    if (estado === "ENTREGADO" && result.rows[0]) {
      await pool.query(
        "UPDATE public.orders SET status='completado' WHERE id=$1",
        [result.rows[0].order_id]
      );
    }

    res.json({ message: "Estado actualizado" });
  } catch (error) {
    console.error("❌ Error al actualizar estado:", error);
    res.status(500).json({ message: "Error al actualizar estado" });
  }
};