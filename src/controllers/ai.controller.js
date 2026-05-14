import axios from "axios";

export const askAI = async (req, res) => {
  try {
    // ✅ Recibimos mensaje desde el frontend
    const { mensaje } = req.body;

    // ✅ Enviamos a Python correctamente
    const response = await axios.post("http://127.0.0.1:8000/chat", {
      pregunta: req.body.message,
    });

    // ✅ Devolvemos la respuesta al frontend
    res.json({
      respuesta: response.data.respuesta,
    });

  } catch (error) {
    console.error("❌ Error en AI controller:", error.message);

    res.status(500).json({
      respuesta: "⚠️ No pude conectarme con la IA",
    });
  }
};