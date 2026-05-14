import { pool } from "../db.js";
import axios from "axios";

const reindexarIA = () => {
  axios.post("http://127.0.0.1:8000/admin/reindex")
    .then(r => console.log("✅ IA reindexada:", r.data.documentos_indexados, "docs"))
    .catch(e => console.warn("⚠️ No se pudo reindexar IA:", e.message));
};

// Obtener todos los clientes
export const getClients = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clients ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener clientes:", error);
    res.status(500).json({ message: "Error al obtener clientes" });
  }
};

// Crear cliente
export const createClient = async (req, res) => {
  const { nombre, nit, telefono, email, ciudad, direccion, tipo_cliente } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO clients (nombre, nit, telefono, email, ciudad, direccion, tipo_cliente)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [nombre, nit, telefono, email, ciudad, direccion, tipo_cliente || "NATURAL"]
    );
    res.json({ message: "Cliente creado", client: result.rows[0] });
    reindexarIA();
  } catch (error) {
    console.error("❌ Error al crear cliente:", error);
    if (error.code === "23505") {
      return res.status(400).json({ message: "Ya existe un cliente con ese NIT" });
    }
    res.status(500).json({ message: "Error al crear cliente" });
  }
};

// Actualizar cliente
export const updateClient = async (req, res) => {
  const { id } = req.params;
  const { nombre, nit, telefono, email, ciudad, direccion, tipo_cliente } = req.body;
  try {
    await pool.query(
      `UPDATE clients SET nombre=$1, nit=$2, telefono=$3, email=$4,
       ciudad=$5, direccion=$6, tipo_cliente=$7 WHERE id=$8`,
      [nombre, nit, telefono, email, ciudad, direccion, tipo_cliente, id]
    );
    res.json({ message: "Cliente actualizado" });
    reindexarIA();
  } catch (error) {
    console.error("❌ Error al actualizar cliente:", error);
    res.status(500).json({ message: "Error al actualizar cliente" });
  }
};

// Eliminar cliente
export const deleteClient = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM clients WHERE id = $1", [id]);
    res.json({ message: "Cliente eliminado" });
    reindexarIA();
  } catch (error) {
    console.error("❌ Error al eliminar cliente:", error);
    res.status(500).json({ message: "Error al eliminar cliente" });
  }
};
