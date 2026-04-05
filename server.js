const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve the _sdk folder
app.use('/_sdk', express.static(path.join(__dirname, '_sdk')));

// In-memory 'database' for Vocentra
let db = {
    items: []
};

// --- DATA SDK Endpoints ---
app.post('/api/data/init', (req, res) => {
    res.json({ isOk: true, data: db.items });
});

app.post('/api/data/create', (req, res) => {
    const item = { ...req.body, __backendId: Date.now().toString() };
    db.items.push(item);
    res.json({ isOk: true, item });
});

app.post('/api/data/update', (req, res) => {
    const item = req.body;
    const index = db.items.findIndex(i => i.__backendId === item.__backendId);
    if (index !== -1) {
        db.items[index] = item;
        res.json({ isOk: true, item });
    } else {
        res.json({ isOk: false, error: 'Not found' });
    }
});

app.post('/api/data/delete', (req, res) => {
    const item = req.body;
    db.items = db.items.filter(i => i.__backendId !== item.__backendId);
    res.json({ isOk: true });
});

// Serve the main HTML file for all other routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'vocentra.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running heavily on http://localhost:${PORT}`);
    console.log(`Vocentra App Backend initialised successfully.`);
});
