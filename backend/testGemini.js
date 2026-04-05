const { generateJSON } = require('./utils/geminiClient');
const fs = require('fs');
async function test() {
    try {
        const res = await generateJSON("respond with {\"test\": 1} in json");
        fs.writeFileSync("testResult.txt", "SUCCESS:\n" + JSON.stringify(res, null, 2));
    } catch (e) {
        fs.writeFileSync("testResult.txt", "FAILED:\n" + e.toString() + "\n" + (e.stack || ""));
    }
}
test();
