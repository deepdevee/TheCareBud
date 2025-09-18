//
// File: /api/chat.js
//
const { GoogleGenerativeAI } = require("@google/generative-ai");

// IMPORTANT: We will set the API key in Vercel's environment variables, not here
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // A simple instruction for the AI model
    const prompt = `You are a friendly and supportive wellness assistant. Keep your answers brief and helpful. User's message: "${message}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
}