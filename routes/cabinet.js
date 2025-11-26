const express = require('express');
const { ensureAuthenticated } = require('../middlewares/auth');
const { User, AdType, AdSpace, Template } = require('../models');
const ExcelJS = require('exceljs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Настройка multer для загрузки изображений
const uploadsDir = path.join(__dirname, '../public/images/user_images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Имя файла будет установлено в обработчике создания шаблона
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения допускаются'));
    }
  }
});

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

router.get('/cabinet/download-ad-types', ensureAuthenticated, async (req, res) => {
  try {
    const moderatorUsername = req.session.user.username;

    // Проверяем, является ли текущий пользователь модератором
    const moderator = await User.findOne({ where: { username: moderatorUsername } });
    if (!moderator || !moderator.is_moder) {
      return res.status(403).json({ success: false, message: 'Доступ запрещен' });
    }

    // Получаем все типы рекламы
    const adTypes = await AdType.findAll({ raw: true });

    // Создаем новую книгу Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Типы рекламы');

    // Добавляем заголовки
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Название', key: 'name', width: 20 },
      { header: 'Описание', key: 'description', width: 30 },
      { header: 'Ширина (px)', key: 'width', width: 15 },
      { header: 'Высота (px)', key: 'height', width: 15 },
      { header: 'Локация', key: 'location', width: 15 },
      { header: 'Базовая цена', key: 'base_price', width: 15 }
    ];

    // Добавляем стиль для заголовков
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC62828' } };

    // Добавляем данные типов рекламы
    adTypes.forEach(adType => {
      worksheet.addRow({
        id: adType.id,
        name: adType.name,
        description: adType.description,
        width: adType.width,
        height: adType.height,
        location: adType.location ? 'Поезд' : 'Станция',
        base_price: adType.base_price
      });
    });

    // Устанавливаем заголовки ответа
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="ad_types_database.xlsx"');

    // Отправляем файл
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

router.get('/cabinet/get-ad-types', ensureAuthenticated, async (req, res) => {
  try {
    const moderatorUsername = req.session.user.username;
    const moderator = await User.findOne({ where: { username: moderatorUsername } });
    if (!moderator || !moderator.is_moder) {
      return res.json({ success: false, message: 'Доступ запрещен' });
    }

    const adTypes = await AdType.findAll({ raw: true });
    res.json({ success: true, adTypes });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Ошибка сервера' });
  }
});

router.get('/cabinet/get-all-ad-types', ensureAuthenticated, async (req, res) => {
  try {
    const adTypes = await AdType.findAll({ raw: true });
    res.json({ success: true, adTypes });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Ошибка сервера' });
  }
});

router.post('/cabinet/add-ad-type', ensureAuthenticated, async (req, res) => {
  try {
    const { name, description, width, height, location, basePrice } = req.body;
    const moderatorUsername = req.session.user.username;

    const moderator = await User.findOne({ where: { username: moderatorUsername } });
    if (!moderator || !moderator.is_moder) {
      return res.json({ success: false, message: 'Доступ запрещен' });
    }

    // Проверяем, не существует ли уже такой тип рекламы
    const existingAdType = await AdType.findOne({ where: { name } });
    if (existingAdType) {
      return res.json({ success: false, message: 'Тип рекламы с таким именем уже существует' });
    }

    await AdType.create({
      name,
      description,
      width,
      height,
      location: location === 1,
      base_price: basePrice
    });

    res.json({ success: true, message: 'Тип рекламы успешно добавлен' });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Ошибка сервера' });
  }
});

router.post('/cabinet/update-ad-type', ensureAuthenticated, async (req, res) => {
  try {
    const { id, name, description, width, height, location, basePrice } = req.body;
    const moderatorUsername = req.session.user.username;

    const moderator = await User.findOne({ where: { username: moderatorUsername } });
    if (!moderator || !moderator.is_moder) {
      return res.json({ success: false, message: 'Доступ запрещен' });
    }

    const adType = await AdType.findByPk(id);
    if (!adType) {
      return res.json({ success: false, message: 'Тип рекламы не найден' });
    }

    // Проверяем, не существует ли уже другой тип рекламы с таким именем
    if (name !== adType.name) {
      const existingAdType = await AdType.findOne({ where: { name } });
      if (existingAdType) {
        return res.json({ success: false, message: 'Тип рекламы с таким именем уже существует' });
      }
    }

    await adType.update({
      name,
      description,
      width,
      height,
      location: location === 1,
      base_price: basePrice
    });

    res.json({ success: true, message: 'Тип рекламы успешно изменен' });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Ошибка сервера' });
  }
});

router.post('/cabinet/delete-ad-type', ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.body;
    const moderatorUsername = req.session.user.username;

    const moderator = await User.findOne({ where: { username: moderatorUsername } });
    if (!moderator || !moderator.is_moder) {
      return res.json({ success: false, message: 'Доступ запрещен' });
    }

    const adType = await AdType.findByPk(id);
    if (!adType) {
      return res.json({ success: false, message: 'Тип рекламы не найден' });
    }

    await adType.destroy();
    res.json({ success: true, message: 'Тип рекламы успешно удален' });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Ошибка сервера' });
  }
});

router.post('/cabinet/add-ad-spaces', ensureAuthenticated, async (req, res) => {
  try {
    const { typeId, quantity, stationId, trainId } = req.body;
    const moderatorUsername = req.session.user.username;

    const moderator = await User.findOne({ where: { username: moderatorUsername } });
    if (!moderator || !moderator.is_moder) {
      return res.json({ success: false, message: 'Доступ запрещен' });
    }

    if (!typeId || !quantity || quantity < 1) {
      return res.json({ success: false, message: 'Некорректные данные' });
    }

    for (let i = 0; i < quantity; i++) {
      await AdSpace.create({
        station_id: stationId || null,
        train_id: trainId || null,
        type_id: typeId,
        availability: true
      });
    }

    res.json({ success: true, message: `Успешно добавлено ${quantity} рекламных мест` });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Ошибка сервера' });
  }
});

router.post('/cabinet/delete-ad-spaces', ensureAuthenticated, async (req, res) => {
  try {
    const { typeId, quantity, stationId, trainId } = req.body;
    const moderatorUsername = req.session.user.username;

    const moderator = await User.findOne({ where: { username: moderatorUsername } });
    if (!moderator || !moderator.is_moder) {
      return res.json({ success: false, message: 'Доступ запрещен' });
    }

    if (!typeId || !quantity || quantity < 1) {
      return res.json({ success: false, message: 'Некорректные данные' });
    }

    const where = {
      type_id: typeId,
      station_id: stationId || null,
      train_id: trainId || null
    };

    const deleted = await AdSpace.destroy({
      where: where,
      limit: quantity
    });

    if (deleted === 0) {
      return res.json({ success: false, message: 'Рекламные места не найдены' });
    }

    res.json({ success: true, message: `Успешно удалено ${deleted} рекламных мест` });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Ошибка сервера' });
  }
});

router.get('/cabinet/download-ad-spaces', ensureAuthenticated, async (req, res) => {
  try {
    const moderatorUsername = req.session.user.username;

    // Проверяем, является ли текущий пользователь модератором
    const moderator = await User.findOne({ where: { username: moderatorUsername } });
    if (!moderator || !moderator.is_moder) {
      return res.status(403).json({ success: false, message: 'Доступ запрещен' });
    }

    // Получаем все рекламные места с информацией о типе, станции и поезде
    const adSpaces = await AdSpace.findAll({ 
      include: [
        { association: 'AdType', attributes: ['id', 'name'] },
        { association: 'MetroStation', attributes: ['id', 'name'] },
        { association: 'Train', attributes: ['id', 'number'] }
      ],
      raw: true
    });

    // Создаем новую книгу Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Рекламные места');

    // Добавляем заголовки
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Тип рекламы', key: 'type_name', width: 20 },
      { header: 'Станция', key: 'station_name', width: 25 },
      { header: 'Поезд', key: 'train_number', width: 15 },
      { header: 'Доступно', key: 'availability', width: 12 }
    ];

    // Добавляем стиль для заголовков
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC62828' } };

    // Добавляем данные рекламных мест
    adSpaces.forEach(adSpace => {
      worksheet.addRow({
        id: adSpace.id,
        type_name: adSpace['AdType.name'] || '-',
        station_name: adSpace['MetroStation.name'] || '-',
        train_number: adSpace['Train.number'] || '-',
        availability: adSpace.availability ? 'Да' : 'Нет'
      });
    });

    // Устанавливаем заголовки ответа
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="ad_spaces_database.xlsx"');

    // Отправляем файл
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

router.post('/cabinet/create-template', ensureAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const { ad_title, type_id } = req.body;
    const userId = req.session.user.id;

    if (!ad_title || !type_id) {
      if (req.file) {
        fs.unlink(req.file.path, err => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      return res.json({ success: false, message: 'Заполните обязательные поля' });
    }

    if (!req.file) {
      return res.json({ success: false, message: 'Загрузите изображение' });
    }

    // Создаем шаблон в базе данных
    const template = await Template.create({
      user_id: userId,
      type_id: type_id,
      ad_title: ad_title,
      content_url: '', // Временно, переименуем после получения ID
      upload_date: new Date(),
      approval_status: 'pending',
      moder_id: null,
      approval_date: null,
      rejection_reason: null
    });

    // Переименовываем файл с использованием ID шаблона
    const ext = path.extname(req.file.originalname);
    const newFilename = `pic${template.id}${ext}`;
    const newPath = path.join(uploadsDir, newFilename);
    const oldPath = req.file.path;

    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        console.error('Error renaming file:', err);
        // Удаляем шаблон если не смогли переименовать файл
        template.destroy();
        return res.json({ success: false, message: 'Ошибка при сохранении изображения' });
      }

      // Обновляем URL в шаблоне
      const contentUrl = `/images/user_images/${newFilename}`;
      template.update({ content_url: contentUrl });

      res.json({ success: true, message: 'Шаблон успешно создан' });
    });
  } catch (err) {
    console.error(err);
    if (req.file) {
      fs.unlink(req.file.path, err => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.json({ success: false, message: 'Ошибка сервера' });
  }
});

router.get('/cabinet/get-templates', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const status = req.query.status || 'pending';

    const templates = await Template.findAll({
      where: {
        user_id: userId,
        approval_status: status
      },
      include: [
        { 
          model: require('../models').AdType, 
          attributes: ['id', 'name', 'location', 'width', 'height'],
          as: 'AdType'
        }
      ],
      raw: false,
      order: [['upload_date', 'DESC']]
    });

    // Преобразуем данные для фронтенда
    const templatesData = templates.map(t => ({
      id: t.id,
      ad_title: t.ad_title,
      type_id: t.type_id,
      content_url: t.content_url,
      upload_date: t.upload_date,
      approval_date: t.approval_date,
      rejection_reason: t.rejection_reason,
      approval_status: t.approval_status,
      AdType: t.AdType ? {
        id: t.AdType.id,
        name: t.AdType.name,
        location: t.AdType.location,
        width: t.AdType.width,
        height: t.AdType.height
      } : null
    }));

    res.json({ success: true, templates: templatesData });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Ошибка сервера' });
  }
});

router.post('/cabinet/delete-template', ensureAuthenticated, async (req, res) => {
  try {
    const { template_id } = req.body;
    const userId = req.session.user.id;

    if (!template_id) {
      return res.json({ success: false, message: 'ID шаблона не указан' });
    }

    const template = await Template.findOne({
      where: {
        id: template_id,
        user_id: userId
      }
    });

    if (!template) {
      return res.json({ success: false, message: 'Шаблон не найден или у вас нет прав на его удаление' });
    }

    // Удаляем файл изображения
    if (template.content_url) {
      const filePath = path.join(__dirname, '../public', template.content_url);
      fs.unlink(filePath, err => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    await template.destroy();
    res.json({ success: true, message: 'Шаблон успешно удален' });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Ошибка сервера' });
  }
});

router.get('/cabinet/get-check-templates', ensureAuthenticated, async (req, res) => {
  try {
    const moderatorId = req.session.user.id;
    const status = req.query.status || 'pending';
    
    // Проверяем, что пользователь - модератор
    const moderator = await User.findByPk(moderatorId);
    if (!moderator || !moderator.is_moder) {
      return res.json({ success: false, message: 'Доступ запрещен' });
    }

    let where = {};
    
    if (status === 'pending') {
      where = { approval_status: 'pending' };
    } else if (status === 'approved') {
      where = { 
        approval_status: 'approved',
        moder_id: moderatorId
      };
    } else if (status === 'rejected') {
      where = { 
        approval_status: 'rejected',
        moder_id: moderatorId
      };
    }

    const templates = await Template.findAll({
      where: where,
      include: [
        { 
          model: require('../models').AdType, 
          attributes: ['id', 'name', 'location', 'width', 'height'],
          as: 'AdType'
        },
        {
          model: require('../models').User,
          attributes: ['id', 'username', 'first_name', 'last_name'],
          as: 'User'
        }
      ],
      raw: false,
      order: [['upload_date', 'DESC']]
    });

    const templatesData = templates.map(t => ({
      id: t.id,
      ad_title: t.ad_title,
      type_id: t.type_id,
      content_url: t.content_url,
      upload_date: t.upload_date,
      approval_date: t.approval_date,
      rejection_reason: t.rejection_reason,
      approval_status: t.approval_status,
      User: t.User ? {
        id: t.User.id,
        username: t.User.username,
        first_name: t.User.first_name,
        last_name: t.User.last_name
      } : null,
      AdType: t.AdType ? {
        id: t.AdType.id,
        name: t.AdType.name,
        location: t.AdType.location,
        width: t.AdType.width,
        height: t.AdType.height
      } : null
    }));

    res.json({ success: true, templates: templatesData });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Ошибка сервера' });
  }
});

router.post('/cabinet/approve-template', ensureAuthenticated, async (req, res) => {
  try {
    const { template_id } = req.body;
    const moderatorId = req.session.user.id;

    const moderator = await User.findByPk(moderatorId);
    if (!moderator || !moderator.is_moder) {
      return res.json({ success: false, message: 'Доступ запрещен' });
    }

    const template = await Template.findByPk(template_id);
    if (!template) {
      return res.json({ success: false, message: 'Шаблон не найден' });
    }

    if (template.approval_status !== 'pending') {
      return res.json({ success: false, message: 'Шаблон уже проверен' });
    }

    await template.update({
      approval_status: 'approved',
      moder_id: moderatorId,
      approval_date: new Date()
    });

    res.json({ success: true, message: 'Шаблон одобрен' });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Ошибка сервера' });
  }
});

router.post('/cabinet/reject-template', ensureAuthenticated, async (req, res) => {
  try {
    const { template_id, rejection_reason } = req.body;
    const moderatorId = req.session.user.id;

    if (!rejection_reason || !rejection_reason.trim()) {
      return res.json({ success: false, message: 'Укажите причину отклонения' });
    }

    const moderator = await User.findByPk(moderatorId);
    if (!moderator || !moderator.is_moder) {
      return res.json({ success: false, message: 'Доступ запрещен' });
    }

    const template = await Template.findByPk(template_id);
    if (!template) {
      return res.json({ success: false, message: 'Шаблон не найден' });
    }

    if (template.approval_status !== 'pending') {
      return res.json({ success: false, message: 'Шаблон уже проверен' });
    }

    await template.update({
      approval_status: 'rejected',
      moder_id: moderatorId,
      approval_date: new Date(),
      rejection_reason: rejection_reason.trim()
    });

    res.json({ success: true, message: 'Шаблон отклонен' });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Ошибка сервера' });
  }
});

module.exports = router;