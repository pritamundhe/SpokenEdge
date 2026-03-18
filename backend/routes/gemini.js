import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        console.log('📝 [Gemini] Incoming request');

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('❌ [Gemini] Missing API Key');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Construct chat history for Gemini
        // Gemini expects: { role: "user" | "model", parts: [{ text: "..." }] }
        const chatHistory = (history || []).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "You are a helpful conversation partner for practicing English. Keep your responses concise, natural, and friendly. Correct grammar if necessary but prioritize flow." }]
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I'm ready to help you practice English. Let's start!" }]
                },
                ...chatHistory
            ],
            generationConfig: {
                maxOutputTokens: 150,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        console.log('✅ [Gemini] Reply:', text.substring(0, 50) + '...');
        res.json({ reply: text });

    } catch (error) {
        console.error('❌ [Gemini] Error:', error);
        res.status(500).json({ message: 'Error processing request' });
    }
});

export default router;
