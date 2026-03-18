import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct listModels on the client instance in some versions, 
        // but usually we can try to just use a known one. 
        // actually older versions had listModels on the class or response.
        // Let's try to just run a simple prompt with 'gemini-pro' to see if that works.

        console.log("Trying gemini-pro...");
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await modelPro.generateContent("Hello");
        console.log("gemini-pro works:", result.response.text());

    } catch (error) {
        console.error("Error:", error.message);
    }
}

listModels();
