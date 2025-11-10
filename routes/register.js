const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const router = express.Router();

router.get('/register', (req, res) => {
  res.render('register', { 
    query: req.query // ← ДОБАВЬТЕ ЭТУ СТРОКУ
  });
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, email, first_name, last_name, father_name, phone } = req.body;
    const exists = await User.findOne({ where: { username } });
    if (exists) {
      return res.redirect('/register?error=exists');
    }
    const hash = await bcrypt.hash(password, 10);
    await User.create({
      username,
      password_hash: hash,
      email,
      first_name,
      last_name,
      father_name,
      phone,
      registration_date: new Date(),
      is_moder: false
    });
    return res.redirect('/login?success=true');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Ошибка регистрации');
    return res.redirect('/register');
  }
});

module.exports = router;