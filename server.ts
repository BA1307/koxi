import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini API client on the server
  // Using lazy check inside endpoint to handle empty/missing key gracefully
  const getGeminiClient = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined. Please configure it in your Settings > Secrets.");
    }
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // API Route for Gemini Chat
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      let ai;
      try {
        ai = getGeminiClient();
      } catch (err: any) {
        return res.status(400).json({ error: err.message });
      }

      // System instruction for our Bwenke Science & Tech AI Tutor
      const systemInstruction = `You are "Bwenke AI", the brilliant, friendly, and expert AI tutor for Bwenke Academy, a premier science and technology school in Kenya. 
Your tone should be inspiring, encouraging, clear, and highly educational. You are an expert in Chemistry (atomic chemistry, chemical practicals), Biology (cellular biology, biological drawing), CBC (Competency-Based Curriculum framework and core competencies), and Computational Design & Technology. 
When explaining topics, use clear formatting, bullet points, and relate concepts to practical Kenyan examples or general real-life science applications. Always answer with patience and enthusiasm to build curiosity and critical thinking in students. Ensure your responses are formatted in clean, professional Markdown. If asked about syllabus-specific questions, help students with detailed explanations and step-by-step guidance.`;

      // Convert history from client format to GenAI Content objects
      const contents = [];
      
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          contents.push({
            role: turn.role === "user" ? "user" : "model",
            parts: [{ text: turn.text }]
          });
        }
      }
      
      // Append the latest user message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
