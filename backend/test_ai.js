const { generateText, generateJSON } = require('./utils/geminiClient');

const runTests = async () => {
    console.log("Testing text generation...");
    try {
        const textResponse = await generateText("Say hello world in one word.");
        console.log("Text:", textResponse);
    } catch (e) {
        console.error("Text Gen Error:", e.message);
    }

    console.log("Testing JSON generation...");
    try {
        const jsonResponse = await generateJSON(`
        Generate a JSON object with a 'greeting' string property.
        Schema: {"greeting": "string"}
        `);
        console.log("JSON:", jsonResponse);
    } catch (e) {
        console.error("JSON Gen Error:", e.message);
    }
};

runTests();
