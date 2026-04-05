// Uses native Node fetch

async function testSkillEngine() {
    try {
        // 1. Get Token
        const loginRes = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: 'jane@example.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        if (!token) throw new Error("Login failed");

        // 2. Start Interview Session
        const startRes = await fetch("http://localhost:5000/api/interview/start", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ mode: 'RECORDED', companySimulation: 'Software Engineer Test' })
        });
        const sessionData = await startRes.json();
        const sessionId = sessionData._id;

        // 3. Complete Interview Session (generates the overall metrics that the Engine needs)
        await fetch(`http://localhost:5000/api/interview/${sessionId}/complete`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });

        // 4. Trigger the Intelligence Engine
        console.log("Fetching Employability API...");
        const empRes = await fetch("http://localhost:5000/api/skills/analyze", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const empData = await empRes.json();

        // 5. Output Verification
        const fs = require('fs');
        fs.writeFileSync('api_response.json', JSON.stringify(empData, null, 2));
        console.log("Successfully wrote response to api_response.json!");

    } catch (e) {
        console.error(e);
    }
}

testSkillEngine();
