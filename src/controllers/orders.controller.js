import { pool } from "../db.js";

export const getOrders = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM public.orders ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener pedidos" });
  }
};

export const createOrder = async (req, res) => {
  const { cliente, modelo, cantidad, status, personalizacion, pago_estado, pago_monto, precio_total } = req.body;
  try {
    await pool.query(
      `INSERT INTO public.orders (cliente, modelo, cantidad, status, personalizacion, pago_estado, pago_monto, precio_total)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [cliente, modelo, cantidad, status, personalizacion, pago_estado || "pendiente", pago_monto || 0, precio_total || 0]
    );
    res.json({ message: "Pedido creado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear pedido" });
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM public.orders WHERE id = $1", [id]);
    res.json({ message: "Pedido eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar" });
  }
};

export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { cliente, modelo, cantidad, status, personalizacion, pago_estado, pago_monto, precio_total } = req.body;
  try {
    await pool.query(
      `UPDATE public.orders 
       SET cliente=$1, modelo=$2, cantidad=$3, status=$4, personalizacion=$5, pago_estado=$6, pago_monto=$7, precio_total=$8
       WHERE id=$9`,
      [cliente, modelo, cantidad, status, personalizacion, pago_estado || "pendiente", pago_monto || 0, precio_total || 0, id]
    );
    res.json({ message: "Pedido actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar" });
  }
};