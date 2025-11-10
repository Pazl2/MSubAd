const express = require('express');
const { ensureAuthenticated } = require('../middlewares/auth');
const { User } = require('../models');
const router = express.Router();

// ДИАГНОСТИКА
console.log('=== DIAGNOSTICS ===');
console.log('ensureAuthenticated type:', typeof ensureAuthenticated);
console.log('ensureAuthenticated value:', ensureAuthenticated);

if (typeof ensureAuthenticated !== 'function') {
  console.error('ERROR: ensureAuthenticated is not a function!');
  // Создаем временную функцию
  const tempAuth = (req, res, next) => {
    if (req.session.user) return next();
    req.flash('error', 'Требуется авторизация');
    res.redirect('/login');
  };
  router.get('/cabinet', tempAuth, async (req, res) => {
    // ваш код
  });
} else {
  router.get('/cabinet', ensureAuthenticated, async (req, res) => {
    try {
      const username = req.session.user.username;
      const user = await User.findOne({ where: { username } });
      if (!user) {
        req.flash('error', 'User not found');
        return res.redirect('/login');
      }
      res.render('cabinet', { user });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Ошибка сервера');
      res.redirect('/');
    }
  });
}

module.exports = router;