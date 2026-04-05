const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("⚠️ Warning: GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "dummy-key-for-dev");

/**
 * Helper to generate text from a prompt
 * @param {string} prompt 
 * @returns {Promise<string>}
 */
const generateText = async (prompt) => {
    try {
        if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini AI Error (Text):", error);
        throw error;
    }
};

/**
 * Helper to generate JSON structured output from a prompt
 * @param {string} prompt 
 * @returns {Promise<any>}
 */
const generateJSON = async (prompt) => {
    // Model fallback chain for maximum reliability
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest"];
    let lastError = null;

    for (const modelName of models) {
        try {
            const jsonModel = genAI.getGenerativeModel({
                model: modelName
            });

            const result = await jsonModel.generateContent(prompt);
            let text = result.response.text();
            
            // Robust JSON extraction
            const firstBrace = text.indexOf('{');
            const firstBracket = text.indexOf('[');
            
            let startIndex = -1;
            let endIndex = -1;
            
            if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
                startIndex = firstBrace;
                endIndex = text.lastIndexOf('}');
            } else if (firstBracket !== -1) {
                startIndex = firstBracket;
                endIndex = text.lastIndexOf(']');
            }
            
            if (startIndex === -1 || endIndex === -1) {
                throw new Error("No JSON found in response");
            }
            
            const jsonString = text.substring(startIndex, endIndex + 1);
            return JSON.parse(jsonString);

        } catch (error) {
            console.warn(`Gemini Model ${modelName} failed, retrying...`, error.message);
            lastError = error;
            // Continue to next model in chain
        }
    }

    console.error("All Gemini models in failover chain failed:", lastError);
    throw lastError;
};

/**
 * Helper to generate JSON structured output from an audio blob prompt
 * @param {Buffer} audioBuffer 
 * @param {string} mimeType 
 * @param {string} prompt 
 * @returns {Promise<any>}
 */
const generateAudioJSON = async (audioBuffer, mimeType, prompt) => {
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];
    let lastError = null;

    for (const modelName of models) {
        try {
            const jsonModel = genAI.getGenerativeModel({
                model: modelName
            });

            const cleanMimeType = mimeType.split(';')[0].trim();
            const result = await jsonModel.generateContent([
                {
                    inlineData: {
                        data: audioBuffer.toString("base64"),
                        mimeType: cleanMimeType
                    }
                },
                prompt
            ]);
            let text = result.response.text();
            
            const firstBrace = text.indexOf('{');
            const firstBracket = text.indexOf('[');
            
            let startIndex = -1;
            let endIndex = -1;
            
            if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
                startIndex = firstBrace;
                endIndex = text.lastIndexOf('}');
            } else if (firstBracket !== -1) {
                startIndex = firstBracket;
                endIndex = text.lastIndexOf(']');
            }
            
            if (startIndex === -1 || endIndex === -1) {
                throw new Error("No JSON found in response");
            }
            
            const jsonString = text.substring(startIndex, endIndex + 1);
            return JSON.parse(jsonString);

        } catch (error) {
            console.warn(`Gemini Model ${modelName} failed for audio, retrying...`, error.message);
            lastError = error;
        }
    }

    console.error("All Gemini models in failover chain failed for audio:", lastError);
    throw lastError;
};

module.exports = { generateText, generateJSON, generateAudioJSON };
