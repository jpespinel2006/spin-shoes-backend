export const askAI = async (req, res) => {
  try {
    res.json({
      respuesta: "⚠️ El asistente IA no está disponible en este momento.",
    });
  } catch (error) {
    console.error("❌ Error en AI controller:", error.message);
    res.status(500).json({
      respuesta: "⚠️ No pude conectarme con la IA",
    });
  }
};