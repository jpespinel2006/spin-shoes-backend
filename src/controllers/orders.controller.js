import { pool } from "../db.js";
import axios from "axios";

const reindexarIA = () => {
  axios.post("http://127.0.0.1:8000/admin/reindex")
    .then(r => console.log("✅ IA reindexada:", r.data.documentos_indexados, "docs"))
    .catch(e => console.warn("⚠️ No se pudo reindexar IA:", e.message));
};

// Obtener pedidos
export const getOrders = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM public.orders ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener pedidos" });
  }
};

// Crear pedido
export const createOrder = async (req, res) => {
  const { cliente, modelo, cantidad, status, personalizacion } = req.body;
  try {
    await pool.query(
      `INSERT INTO public.orders (cliente, modelo, cantidad, status, personalizacion)
       VALUES ($1,$2,$3,$4,$5)`,
      [cliente, modelo, cantidad, status, personalizacion]
    );
    res.json({ message: "Pedido creado" });
    reindexarIA();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear pedido" });
  }
};

// Eliminar pedido
export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM public.orders WHERE id = $1", [id]);
    res.json({ message: "Pedido eliminado" });
    reindexarIA();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar" });
  }
};

// Actualizar pedido
export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { cliente, modelo, cantidad, status, personalizacion } = req.body;
  try {
    await pool.query(
      `UPDATE public.orders 
       SET cliente=$1, modelo=$2, cantidad=$3, status=$4, personalizacion=$5
       WHERE id=$6`,
      [cliente, modelo, cantidad, status, personalizacion, id]
    );
    res.json({ message: "Pedido actualizado" });
    reindexarIA();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar" });
  }
};
