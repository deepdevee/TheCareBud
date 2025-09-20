const { GoogleGenerativeAI } = require("@google/generative-ai");

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

    const prompt = `
      You are 'Bud,' the AI wellness assistant from TheCareBud.
      Your personality is: warm, empathetic, patient, and always encouraging. You are like a gentle, supportive friend.
      Your goal is to provide helpful, non-judgmental wellness tips and a listening ear.
      
      RULES:
      1. Keep your responses positive and supportive.
      2. Speak in short, easy-to-understand paragraphs.
      3. Never give medical advice. You are a wellness guide, not a doctor.
      4. If a user mentions serious distress or wanting to harm themselves, you must gently and immediately recommend they contact a professional crisis hotline or therapist.
      5. Address the user directly and kindly.

      Now, respond to the following user message: "${message}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
}
