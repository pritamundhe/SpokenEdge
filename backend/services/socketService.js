import { Server } from 'socket.io';
import { createClient } from '@deepgram/sdk';
import dotenv from 'dotenv';

dotenv.config();

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

    const apiKey = process.env.DEEPGRAM_API_KEY;
    console.log("Deepgram API Key loaded:", apiKey ? `Yes (${apiKey.substring(0, 4)}...)` : "No");

    const deepgram = createClient(apiKey);

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        let deepgramLive = null;
        let audioBuffer = []; // Buffer for initial chunks (headers)

        const setupDeepgram = () => {
            // Simplified config for debugging
            deepgramLive = deepgram.listen.live({
                model: "nova-2",
                language: "en-US",
                smart_format: true,
                interim_results: true,
                // utterance_end_ms: 1000,
                // vad_events: true,
                // endpointing: 300,
                // diarize: false
            });

            if (deepgramLive) {
                deepgramLive.on("open", () => {
                    console.log("Deepgram connection open");

                    // Flush buffer
                    if (audioBuffer.length > 0) {
                        console.log(`Flushing ${audioBuffer.length} buffered chunks to Deepgram`);
                        audioBuffer.forEach(chunk => {
                            deepgramLive.send(chunk);
                        });
                        audioBuffer = [];
                    }

                    // KeepAlive to prevent timeout
                    if (deepgramLive.keepAlive) deepgramLive.keepAlive();
                });

                deepgramLive.on("transcript", (data) => {
                    const transcript = data.channel?.alternatives?.[0]?.transcript;
                    const isFinal = data.is_final;

                    if (transcript) {
                        // console.log(`[Deepgram] ${isFinal ? 'FINAL' : 'Interim'}: ${transcript}`);
                        // Send interim results too so user sees it happening
                        socket.emit('transcription_result', {
                            text: transcript,
                            isFinal: isFinal
                        });
                    }
                });

                deepgramLive.on("close", (e) => {
                    console.log("Deepgram connection closed", e);
                });

                deepgramLive.on("error", (err) => {
                    console.error("Deepgram error:", err);
                });

                deepgramLive.on("warning", (warn) => {
                    console.warn("Deepgram warning:", warn);
                });
            }
        };

        setupDeepgram();

        // KeepAlive
        const keepAliveInterval = setInterval(() => {
            if (deepgramLive && deepgramLive.getReadyState() === 1) {
                deepgramLive.keepAlive();
            }
        }, 3000);

        socket.on('transcribe_chunk', (audioData) => {
            // console.log(`Received chunk: ${audioData ? audioData.length : 0} bytes`);
            if (deepgramLive && deepgramLive.getReadyState() === 1) {
                try {
                    deepgramLive.send(audioData);
                } catch (e) {
                    console.error("Error sending to Deepgram:", e);
                }
            } else {
                // Buffer chunks if connecting
                // console.log("Buffering chunk, Deepgram not ready");
                audioBuffer.push(audioData);

                // If buffer gets too big or connection fails, we might need logic to reset
                if (deepgramLive && deepgramLive.getReadyState() >= 2) {
                    console.log("Deepgram socket closed, reconnecting...");
                    setupDeepgram();
                }
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            clearInterval(keepAliveInterval);
            if (deepgramLive) {
                deepgramLive.finish();
                deepgramLive = null;
            }
            audioBuffer = [];
        });
    });

    return io;
};
