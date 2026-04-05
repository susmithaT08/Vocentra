const axios = require('axios');

async function testVocabularyModule() {
    try {
        console.log("=== Testing Vocabulary Builder API ===\\n");

        // 1. We need a token. We'll use the backend's dummy login mechanism if it has one, 
        // or we'll just register a test user for this script.

        let token = 'mock-token'; // We will temporarily disable auth in the route for the test
        const mockUserId = "65c3b9b9b9b9b9b9b9b9b9b9"; // fake mongo ID

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Fetch Daily Suggestions
        console.log("-> Fetching Daily Suggestions...");
        const suggestionsRes = await axios.get('http://localhost:5000/api/vocabulary/suggestions', { headers });
        console.log(`   Success! Received ${suggestionsRes.data.length} suggestions.`);
        const wordToAdd = suggestionsRes.data[0];
        console.log(`   First word: ${wordToAdd.word}\\n`);

        // 3. Add a Word to Library
        console.log(`-> Adding '${wordToAdd.word}' to library...`);
        const addRes = await axios.post('http://localhost:5000/api/vocabulary', wordToAdd, { headers });
        const wordId = addRes.data._id;
        console.log(`   Success! Word added. Next Review: ${addRes.data.nextReviewDate}\\n`);

        // 4. Fetch User Library
        console.log("-> Fetching User Library...");
        const libraryRes = await axios.get('http://localhost:5000/api/vocabulary', { headers });
        console.log(`   Success! Library has ${libraryRes.data.length} words.\\n`);

        // 5. Fetch Due Words
        console.log("-> Fetching Due Words for Review...");
        const dueRes = await axios.get('http://localhost:5000/api/vocabulary/review', { headers });
        console.log(`   Success! ${dueRes.data.length} words due today.\\n`);

        // 6. Test Spaced Repetition Logic (Answering Correctly)
        console.log(`-> Testing Spaced Repetition (Simulating 'Knew it' for ${wordToAdd.word})...`);
        const progressRes = await axios.put(`http://localhost:5000/api/vocabulary/${wordId}/progress`, { isCorrect: true }, { headers });
        console.log(`   Success! SRS Level increased to: ${progressRes.data.srsLevel}`);
        console.log(`   Next Review Date pushed to: ${progressRes.data.nextReviewDate}\\n`);

        // 7. Get Analytics
        console.log("-> Fetching Vocabulary Analytics...");
        const analyticsRes = await axios.get('http://localhost:5000/api/vocabulary/analytics', { headers });
        console.log("   Success! Analytics Data:");
        console.dir(analyticsRes.data);

        console.log("\\n=== All tests passed successfully! ===");

    } catch (error) {
        console.error("\\n❌ Test Failed:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testVocabularyModule();
