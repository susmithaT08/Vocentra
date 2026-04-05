const express = require('express');
const router = express.Router();
const { generateProjects } = require('../controllers/projectGeneratorController');

router.post('/generate', generateProjects);

module.exports = router;
