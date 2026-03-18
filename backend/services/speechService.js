import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY
});

/**
 * Transcribe audio file with sentiment analysis
 * @param {string} audioUrl - URL or local path to audio file
 * @param {string} language - Language code (e.g., 'en', 'es', 'fr')
 * @returns {Promise<Object>} Transcription with sentiment data
 */
export async function transcribeAudio(audioUrl, language = 'en') {
    try {
        const config = {
            audio: audioUrl,
            language_code: language,
            sentiment_analysis: true,
            speaker_labels: true,
            punctuate: true,
            format_text: true,
        };

        const transcript = await client.transcripts.transcribe(config);

        if (transcript.status === 'error') {
            throw new Error(transcript.error);
        }

        return {
            text: transcript.text,
            words: transcript.words,
            sentiment_analysis_results: transcript.sentiment_analysis_results,
            confidence: transcript.confidence,
            audio_duration: transcript.audio_duration,
        };
    } catch (error) {
        console.error('AssemblyAI Transcription Error:', error);
        throw error;
    }
}

/**
 * Create real-time transcription session
 * @param {string} language - Language code
 * @returns {Object} Real-time transcriber instance
 */
export function createRealtimeTranscriber(language = 'en') {
    const rt = client.realtime.transcriber({
        language_code: language,
        sample_rate: 16000,
        encoding: 'pcm_s16le',
    });

    return rt;
}

/**
 * Analyze sentiment from text segments
 * @param {Array} sentimentResults - Sentiment analysis results from AssemblyAI
 * @returns {Object} Aggregated sentiment breakdown
 */
export function analyzeSentiment(sentimentResults) {
    if (!sentimentResults || sentimentResults.length === 0) {
        return {
            positive: 0,
            negative: 0,
            neutral: 0,
            dominant: 'neutral',
        };
    }

    const counts = {
        POSITIVE: 0,
        NEGATIVE: 0,
        NEUTRAL: 0,
    };

    sentimentResults.forEach((result) => {
        counts[result.sentiment]++;
    });

    const total = sentimentResults.length;
    const breakdown = {
        positive: (counts.POSITIVE / total) * 100,
        negative: (counts.NEGATIVE / total) * 100,
        neutral: (counts.NEUTRAL / total) * 100,
    };

    // Determine dominant sentiment
    const dominant = Object.keys(counts).reduce((a, b) =>
        counts[a] > counts[b] ? a : b
    ).toLowerCase();

    return {
        ...breakdown,
        dominant,
        totalSegments: total,
    };
}

/**
 * Extract emotions from sentiment data (if available)
 * @param {Array} sentimentResults - Sentiment results
 * @returns {Object} Emotion breakdown
 */
export function extractEmotions(sentimentResults) {
    // AssemblyAI provides basic sentiment, we can enhance this
    // For now, map sentiment to basic emotions
    const emotions = {
        happy: 0,
        sad: 0,
        neutral: 0,
        confident: 0,
    };

    if (!sentimentResults) return emotions;

    sentimentResults.forEach((result) => {
        const confidence = result.confidence || 0.5;

        switch (result.sentiment) {
            case 'POSITIVE':
                emotions.happy += confidence;
                emotions.confident += confidence * 0.7;
                break;
            case 'NEGATIVE':
                emotions.sad += confidence;
                break;
            case 'NEUTRAL':
                emotions.neutral += confidence;
                break;
        }
    });

    // Normalize
    const total = Object.values(emotions).reduce((a, b) => a + b, 0);
    if (total > 0) {
        Object.keys(emotions).forEach((key) => {
            emotions[key] = (emotions[key] / total) * 100;
        });
    }

    return emotions;
}

export default {
    transcribeAudio,
    createRealtimeTranscriber,
    analyzeSentiment,
    extractEmotions,
};
