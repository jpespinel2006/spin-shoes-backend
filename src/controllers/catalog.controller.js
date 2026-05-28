import { pool } from "../db.js";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getCatalog = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM public.catalog ORDER BY referencia ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener catálogo:", error);
    res.status(500).json({ message: "Error al obtener catálogo" });
  }
};

export const createProduct = async (req, res) => {
  const { referencia, descripcion, precio, imagen_url, color_meta } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO public.catalog (referencia, descripcion, precio, imagen_url, color_meta)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [referencia, descripcion, precio, imagen_url || null, color_meta || null]
    );
    res.json({ message: "Producto creado", product: result.rows[0] });
  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    if (error.code === "23505") {
      return res.status(400).json({ message: "Ya existe una referencia con ese código" });
    }
    res.status(500).json({ message: "Error al crear producto" });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { referencia, descripcion, precio, imagen_url, color_meta } = req.body;
  try {
    await pool.query(
      `UPDATE public.catalog SET referencia=$1, descripcion=$2, precio=$3, imagen_url=$4, color_meta=$5
       WHERE id=$6`,
      [referencia, descripcion, precio, imagen_url, color_meta || null, id]
    );
    res.json({ message: "Producto actualizado" });
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error);
    res.status(500).json({ message: "Error al actualizar producto" });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM public.catalog WHERE id = $1", [id]);
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);
    res.status(500).json({ message: "Error al eliminar producto" });
  }
};

export const uploadImagenColor = async (req, res) => {
  const { id } = req.params;
  const color = (req.query.color || "default").toLowerCase().trim();

  if (!req.file) {
    return res.status(400).json({ message: "No se recibió ninguna imagen" });
  }

  try {
    const imageUrl = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "spin-shoes", resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );
      Readable.from(req.file.buffer).pipe(stream);
    });

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