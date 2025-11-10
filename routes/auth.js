const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login', { 
    query: req.query
  });
});

router.post('/login', async (req, res) => {
  console.log('=== LOGIN ATTEMPT ===');
  console.log('Username:', req.body.username);
  
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    
    console.log('User found:', !!user);
    
    if (!user) {
      console.log('User not found');
      return res.redirect('/login?error=notfound');
    }
    
    console.log('Comparing password...');
    const valid = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', valid);
    
    if (!valid) {
      console.log('Invalid password');
      return res.redirect('/login?error=invalid');
    }
    
    console.log('Creating session...');
    
    // Простая установка сессии
    req.session.user = {
      id: user.id,
      username: user.username,
      is_moder: user.is_moder
    };
    
    console.log('Session created, immediate redirect...');
    
    // Немедленный редирект БЕЗ save()
    res.redirect('/cabinet');
    
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.redirect('/login?error=server');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;



