import axios from 'axios';

const LANGUAGETOOL_API_URL = 'https://api.languagetoolplus.com/v2/check';
const FREE_API_URL = 'https://api.languagetool.org/v2/check';

/**
 * Check grammar and style using LanguageTool API
 * @param {string} text - Text to analyze
 * @param {string} language - Language code (e.g., 'en-US', 'es', 'fr')
 * @returns {Promise<Object>} Grammar analysis results
 */
export async function checkGrammar(text, language = 'en-US') {
    try {
        const apiUrl = process.env.LANGUAGETOOL_API_KEY
            ? LANGUAGETOOL_API_URL
            : FREE_API_URL;

        const params = new URLSearchParams({
            text: text,
            language: language,
            enabledOnly: 'false',
        });

        const headers = process.env.LANGUAGETOOL_API_KEY
            ? {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${process.env.LANGUAGETOOL_API_KEY}`,
            }
            : {
                'Content-Type': 'application/x-www-form-urlencoded',
            };

        const response = await axios.post(apiUrl, params.toString(), {
            headers,
        });

        const { matches, language: detectedLang } = response.data;

        return {
            errors: matches.map((match) => ({
                message: match.message,
                shortMessage: match.shortMessage,
                offset: match.offset,
                length: match.length,
                rule: match.rule.id,
                category: match.rule.category.name,
                suggestions: match.replacements.map((r) => r.value).slice(0, 3),
                context: match.context.text,
                type: match.rule.issueType,
            })),
            totalErrors: matches.length,
            detectedLanguage: detectedLang.name,
        };
    } catch (error) {
        console.error('LanguageTool API Error:', error.response?.data || error.message);
        throw new Error('Grammar check failed');
    }
}

/**
 * Analyze vocabulary usage and suggest improvements
 * @param {string} text - Text to analyze
 * @returns {Object} Vocabulary analysis
 */
export function analyzeVocabulary(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(words);

    // Common words to filter out
    const commonWords = new Set([
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
        'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
        'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
        'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    ]);

    const meaningfulWords = words.filter(word => !commonWords.has(word));
    const uniqueMeaningfulWords = new Set(meaningfulWords);

    // Calculate vocabulary richness (lexical diversity)
    const vocabularyRichness = words.length > 0
        ? (uniqueWords.size / words.length) * 100
        : 0;

    // Word frequency analysis
    const wordFrequency = {};
    words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });

    // Find repeated words (potential overuse)
    const repeatedWords = Object.entries(wordFrequency)
        .filter(([word, count]) => count > 2 && !commonWords.has(word))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word, count]) => ({ word, count }));

    return {
        totalWords: words.length,
        uniqueWords: uniqueWords.size,
        meaningfulWords: meaningfulWords.length,
        uniqueMeaningfulWords: uniqueMeaningfulWords.size,
        vocabularyRichness: Math.round(vocabularyRichness),
        repeatedWords,
        score: calculateVocabularyScore(vocabularyRichness, uniqueMeaningfulWords.size, words.length),
    };
}

/**
 * Calculate vocabulary score based on richness and complexity
 * @param {number} richness - Vocabulary richness percentage
 * @param {number} uniqueCount - Number of unique meaningful words
 * @param {number} totalWords - Total word count
 * @returns {number} Score from 0-100
 */
function calculateVocabularyScore(richness, uniqueCount, totalWords) {
    if (totalWords === 0) return 0;

    // Base score from richness (40% weight)
    const richnessScore = Math.min(richness * 0.8, 40);

    // Unique word diversity (30% weight)
    const diversityScore = Math.min((uniqueCount / Math.max(totalWords * 0.5, 1)) * 30, 30);

    // Length bonus (30% weight) - reward longer, more complex responses
    const lengthScore = Math.min((totalWords / 50) * 30, 30);

    return Math.round(richnessScore + diversityScore + lengthScore);
}

/**
 * Analyze sentence structure
 * @param {string} text - Text to analyze
 * @returns {Object} Sentence structure analysis
 */
export function analyzeSentenceStructure(text) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];

    const sentenceLengths = sentences.map(s => {
        const words = s.trim().match(/\b\w+\b/g) || [];
        return words.length;
    });

    const avgLength = sentenceLengths.length > 0
        ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
        : 0;

    // Classify sentences by length
    const short = sentenceLengths.filter(len => len < 10).length;
    const medium = sentenceLengths.filter(len => len >= 10 && len <= 20).length;
    const long = sentenceLengths.filter(len => len > 20).length;

    return {
        totalSentences: sentences.length,
        averageLength: Math.round(avgLength),
        distribution: {
            short,
            medium,
            long,
        },
        variety: calculateVariety(sentenceLengths),
    };
}

/**
 * Calculate sentence variety score
 * @param {Array<number>} lengths - Array of sentence lengths
 * @returns {number} Variety score from 0-100
 */
function calculateVariety(lengths) {
    if (lengths.length < 2) return 50;

    // Calculate standard deviation
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);

    // Higher standard deviation = more variety
    // Normalize to 0-100 scale
    return Math.min(Math.round((stdDev / mean) * 100), 100);
}

/**
 * Calculate overall grammar score
 * @param {number} totalErrors - Total grammar errors found
 * @param {number} wordCount - Total words in text
 * @returns {number} Score from 0-100
 */
export function calculateGrammarScore(totalErrors, wordCount) {
    if (wordCount === 0) return 0;

    // Error rate per 100 words
    const errorRate = (totalErrors / wordCount) * 100;

    // Convert to score (fewer errors = higher score)
    // 0 errors = 100, 10+ errors per 100 words = 0
    const score = Math.max(0, 100 - (errorRate * 10));

    return Math.round(score);
}

export default {
    checkGrammar,
    analyzeVocabulary,
    analyzeSentenceStructure,
    calculateGrammarScore,
};
