import axios from "axios";

const PYTHON_URL = "https://spin-shoes-python-production.up.railway.app";

export const askAI = async (req, res) => {
  try {
    const { message } = req.body;
    const response = await axios.post(`${PYTHON_URL}/chat`, {
      pregunta: message,
    });
    res.json({ respuesta: response.data.respuesta });
  } catch (error) {
    console.error("❌ Error en AI controller:", error.message);
    res.status(500).json({
      respuesta: "⚠️ No pude conectarme con la IA",
    });
  }
};

export const reindexAI = async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/admin/reindex`);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error reindex:", error.message);
    res.status(500).json({ message: "Error al reindexar" });
  }
};