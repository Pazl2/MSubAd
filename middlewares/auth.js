function ensureAuthenticated(req, res, next) {
  if (req.session.user) return next();
  req.flash('error', 'Требуется авторизация');
  res.redirect('/login');
}

module.exports = { ensureAuthenticated };
