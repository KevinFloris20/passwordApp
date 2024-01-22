const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

router.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/style.css'));
});

router.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/script.js'));
});

module.exports = router;
