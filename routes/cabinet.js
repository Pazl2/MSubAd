const express = require('express');
const { ensureAuthenticated } = require('../middlewares/auth');
const { User } = require('../models');
const ExcelJS = require('exceljs');
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

router.post('/cabinet/update', ensureAuthenticated, async (req, res) => {
  try {
    const { first_name, last_name, father_name, email, phone } = req.body;
    const username = req.session.user.username;

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.json({ success: false, message: 'Некорректный формат email' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.json({ success: false, message: 'Пользователь не найден' });
    }

    // Обновляем данные
    await user.update({
      first_name,
      last_name,
      father_name,
      email,
      phone
    });

    res.json({ success: true, message: 'Данные обновлены' });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Ошибка сервера' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.redirect('/cabinet');
    }
    res.redirect('/login');
  });
});

router.post('/cabinet/change-role', ensureAuthenticated, async (req, res) => {
  try {
    const { username, role } = req.body;
    const moderatorUsername = req.session.user.username;

    // Проверяем, является ли текущий пользователь модератором
    const moderator = await User.findOne({ where: { username: moderatorUsername } });
    if (!moderator || !moderator.is_moder) {
      return res.json({ success: false, message: 'Доступ запрещен' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.json({ success: false, message: 'Пользователь не найден' });
    }

    const newRole = role === 'moderator';
    if (user.is_moder === newRole) {
      return res.json({ success: false, message: `Пользователь уже ${newRole ? 'модератор' : 'пользователь'}` });
    }

    await user.update({ is_moder: newRole });
    res.json({ success: true, message: `Роль успешно изменена на ${newRole ? 'Модератор' : 'Пользователь'}` });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Ошибка сервера' });
  }
});

router.post('/cabinet/delete-user', ensureAuthenticated, async (req, res) => {
  try {
    const { username } = req.body;
    const moderatorUsername = req.session.user.username;

    // Проверяем, является ли текущий пользователь модератором
    const moderator = await User.findOne({ where: { username: moderatorUsername } });
    if (!moderator || !moderator.is_moder) {
      return res.json({ success: false, message: 'Доступ запрещен' });
    }

    // Проверяем, не пытается ли модератор удалить сам себя
    if (username === moderatorUsername) {
      return res.json({ success: false, message: 'Вы не можете удалить самого себя' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.json({ success: false, message: 'Пользователь не найден' });
    }

    await user.destroy();
    res.json({ success: true, message: 'Пользователь успешно удален' });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Ошибка сервера' });
  }
});

router.get('/cabinet/download-users', ensureAuthenticated, async (req, res) => {
  try {
    const moderatorUsername = req.session.user.username;

    // Проверяем, является ли текущий пользователь модератором
    const moderator = await User.findOne({ where: { username: moderatorUsername } });
    if (!moderator || !moderator.is_moder) {
      return res.status(403).json({ success: false, message: 'Доступ запрещен' });
    }

    // Получаем всех пользователей
    const users = await User.findAll({ raw: true });

    // Создаем новую книгу Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Пользователи');

    // Добавляем заголовки
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Логин', key: 'username', width: 20 },
      { header: 'Имя', key: 'first_name', width: 15 },
      { header: 'Фамилия', key: 'last_name', width: 15 },
      { header: 'Отчество', key: 'father_name', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Телефон', key: 'phone', width: 15 },
      { header: 'Дата регистрации', key: 'registration_date', width: 20 },
      { header: 'Роль', key: 'is_moder', width: 15 }
    ];

    // Добавляем стиль для заголовков
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC62828' } };

    // Добавляем данные пользователей
    users.forEach(user => {
      worksheet.addRow({
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        father_name: user.father_name,
        email: user.email,
        phone: user.phone,
        registration_date: new Date(user.registration_date).toLocaleString('ru-RU'),
        is_moder: user.is_moder ? 'Модератор' : 'Пользователь'
      });
    });

    // Устанавливаем заголовки ответа
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="users_database.xlsx"');

    // Отправляем файл
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

module.exports = router;