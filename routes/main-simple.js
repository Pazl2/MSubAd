// routes/main-simple.js - для теста
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('home', { title: 'MSubAd' });
});

module.exports = router;