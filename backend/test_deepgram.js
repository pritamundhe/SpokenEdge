
import { createClient } from "@deepgram/sdk";
import dotenv from 'dotenv';
dotenv.config();

const testKey = async () => {
    const key = process.env.DEEPGRAM_API_KEY;
    console.log(`Using key: ${key ? key.substring(0, 5) + '...' : 'NONE'}`);

    if (!key) {
        console.error("No key found in environment");
        return;
    }

    try {
        const deepgram = createClient(key);
        // Try a simple manageable request, like listing projects or usage if possible, 
        // OR just try to create a live connection and see if it immediately fails with 401.
        // Better: use the analyze URL or pre-recorded basic test.

        console.log("Attempting to connect to Deepgram API...");
        // We'll try to transribe a remote file (short sample)
        const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
            { url: "https://static.deepgram.com/examples/interview_speech-analytics.wav" },
            { model: "nova-2" }
        );

        if (error) {
            console.error("API Error:", error);
        } else {
            console.log("Success! Transcription received.");
            console.log("Snippet:", result.results.channels[0].alternatives[0].transcript.substring(0, 50));
        }
    } catch (err) {
        console.error("Exception:", err);
    }
}

testKey();
