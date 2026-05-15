import { pool } from "../db.js";
import axios from "axios";

// Llama al reindex de Python en segundo plano (sin bloquear la respuesta)
const reindexarIA = () => {
  axios.post("http://127.0.0.1:8000/admin/reindex")
    .then(r => console.log("✅ IA reindexada:", r.data.documentos_indexados, "docs"))
    .catch(e => console.warn("⚠️ No se pudo reindexar IA:", e.message));
};

// Obtener todo el catálogo
export const getCatalog = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM public.catalog ORDER BY referencia ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener catálogo:", error);
    res.status(500).json({ message: "Error al obtener catálogo" });
  }
};

// Crear referencia
export const createProduct = async (req, res) => {
  const { referencia, descripcion, precio, imagen_url } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO public.catalog (referencia, descripcion, precio, imagen_url)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [referencia, descripcion, precio, imagen_url || null]
    );
    res.json({ message: "Producto creado", product: result.rows[0] });
    reindexarIA();
  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    if (error.code === "23505") {
      return res.status(400).json({ message: "Ya existe una referencia con ese código" });
    }
    res.status(500).json({ message: "Error al crear producto" });
  }
};

// Actualizar referencia
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { referencia, descripcion, precio, imagen_url } = req.body;
  try {
    await pool.query(
      `UPDATE public.catalog SET referencia=$1, descripcion=$2, precio=$3, imagen_url=$4
       WHERE id=$5`,
      [referencia, descripcion, precio, imagen_url, id]
    );
    res.json({ message: "Producto actualizado" });
    reindexarIA();
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error);
    res.status(500).json({ message: "Error al actualizar producto" });
  }
};

// Eliminar referencia
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM public.catalog WHERE id = $1", [id]);
    res.json({ message: "Producto eliminado" });
    reindexarIA();
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);
    res.status(500).json({ message: "Error al eliminar producto" });
  }
};

// Subir imagen por color para una referencia
export const uploadImagenColor = async (req, res) => {
  const { id } = req.params;
  const color = (req.query.color || "default").toLowerCase().trim();

  if (!req.file) {
    return res.status(400).json({ message: "No se recibió ninguna imagen" });
  }

  const imageUrl = `http://localhost:4000/uploads/${req.file.filename}`;

  try {
    const result = await pool.query("SELECT imagen_url FROM public.catalog WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    let imagenes = {};
    const raw = result.rows[0].imagen_url;
    if (raw) {
      try { imagenes = JSON.parse(raw); } catch { imagenes = { default: raw }; }
    }

    imagenes[color] = imageUrl;

    await pool.query(
      "UPDATE public.catalog SET imagen_url = $1 WHERE id = $2",
      [JSON.stringify(imagenes), id]
    );

    res.json({ message: `Imagen del color "${color}" guardada`, url: imageUrl, imagenes });
  } catch (error) {
    console.error("❌ Error al subir imagen:", error);
    res.status(500).json({ message: "Error al guardar imagen" });
  }
};
