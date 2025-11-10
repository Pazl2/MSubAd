require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const { sequelize } = require('./models');

const mainRouter = require('./routes/main');
const authRouter = require('./routes/auth');
const registerRouter = require('./routes/register');
const cabinetRouter = require('./routes/cabinet');
const catalogRouter = require('./routes/catalog');

const app = express();
const PORT = process.env.PORT || 3001;

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// static
app.use('/static', express.static(path.join(__dirname, 'public')));

// parsers
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// session + flash
app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: true, // ← ИЗМЕНИТЕ НА true
  saveUninitialized: true, // ← ИЗМЕНИТЕ НА true
  cookie: { 
    maxAge: 24*60*60*1000,
    httpOnly: true,
    secure: false // для разработки
  }
}));
app.use(flash());

// make flash and user available in templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// // Детальная диагностика всех роутеров
// console.log('=== ДЕТАЛЬНАЯ ДИАГНОСТИКА РОУТЕРОВ ===');

// const routers = [
//   { name: 'mainRouter', value: mainRouter, file: './routes/main' },
//   { name: 'authRouter', value: authRouter, file: './routes/auth' },
//   { name: 'registerRouter', value: registerRouter, file: './routes/register' },
//   { name: 'cabinetRouter', value: cabinetRouter, file: './routes/cabinet' },
//   { name: 'catalogRouter', value: catalogRouter, file: './routes/catalog' }
// ];

// routers.forEach(({ name, value, file }) => {
//   console.log(`--- ${name} (${file}) ---`);
//   console.log('Тип:', typeof value);
//   console.log('Является функцией:', typeof value === 'function');
//   console.log('Свойства:', Object.keys(value || {}));
//   console.log('');
// });

// // Также проверьте сами импорты
// console.log('=== ПРОВЕРКА ИМПОРТОВ ===');
// console.log('mainRouter:', mainRouter);
// console.log('');

// routers
app.use('/', mainRouter);
app.use('/', authRouter);
app.use('/', registerRouter);
app.use('/', cabinetRouter);
app.use('/catalog', catalogRouter);

// sync DB then start
(async () => {
  try {
    await sequelize.authenticate();
    // sync models (use { force: true } only for dev)
    await sequelize.sync(); 
    console.log('DB connected and synced.');
    app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));
  } catch (err) {
    console.error('Unable to start app:', err);
  }
})();
