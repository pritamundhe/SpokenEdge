import express from 'express';

const router = express.Router();

router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        console.log('📝 [DeepSeek] Incoming chat request');

        if (!message && (!history || history.length === 0)) {
            console.warn('⚠️ [DeepSeek] Missing message/history in request body');
            return res.status(400).json({ message: 'Message or history is required' });
        }

        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            console.error('❌ [DeepSeek] Missing API Key in .env');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        // Construct messages array from history + current message
        let messages = [
            { role: "system", content: "You are a helpful conversation partner for practicing English. Keep your responses concise and natural slightly informal." }
        ];

        if (history && Array.isArray(history)) {
            messages = [...messages, ...history];
        }

        if (message) {
            messages.push({ role: "user", content: message });
        }

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: messages,
                stream: false
            })
        });

        console.log(`📡 [DeepSeek] Response Status: ${response.status}`);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ [DeepSeek] API Error:', JSON.stringify(errorData, null, 2));
            return res.status(response.status).json({ message: 'Error from AI provider', details: errorData });
        }

        const data = await response.json();
        const botReply = data.choices[0].message.content;
        console.log('✅ [DeepSeek] Reply received:', botReply.substring(0, 50) + '...');

        res.json({ reply: botReply });

    } catch (error) {
        console.error('❌ [DeepSeek] Server Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
