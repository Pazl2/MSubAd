const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('home', { title: 'MSubAd' });
});

router.get('/about', (req, res) => {
  res.render('about', { title: 'О нас — MSubAd' });
});

module.exports = router;