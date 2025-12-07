// routes/catalog.js
const express = require('express');
const { Line, MetroStation, AdType, MetroStations, Train } = require('../models');
const router = express.Router();

const defaultRenderParams = {
  title: 'Обзор станций',
  selectedAds: false,
  stations: null,
  station: null,
  selectedLine: null,
  ads: null,
  error: null
};

// Main catalog page - initial render (lines list)
router.get('/', async (req, res) => {
  try {
    const lines = await Line.findAll({ order: [['id','ASC']] });
    res.render('catalog', { ...defaultRenderParams, lines });
  } catch (err) {
    console.error(err);
    res.status(500).render('catalog', { ...defaultRenderParams, lines: [], error: 'Ошибка сервера' });
  }
});

/*
  JSON API endpoints used by frontend JS.
  They return JSON only and are intended for AJAX.
*/

// GET /catalog/api/line/:id  -> { line: {...}, stations: [...] }
router.get('/api/line/:id', async (req, res) => {
  try {
    const line = await Line.findByPk(req.params.id);
    if (!line) return res.status(404).json({ error: 'Линия не найдена' });

    const stations = await MetroStation.findAll({ where: { line_id: line.id }, order: [['id','ASC']] });
    res.json({ line, stations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении линии' });
  }
});

// GET /catalog/api/station/:id  -> { station: {...} }
router.get('/api/station/:id', async (req, res) => {
  try {
    const station = await MetroStation.findByPk(req.params.id, { include: Line });
    if (!station) return res.status(404).json({ error: 'Станция не найдена' });
    res.json({ station });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении станции' });
  }
});

// GET /catalog/api/ads?location=true|false  -> { ads: [...] }
router.get('/api/ads', async (req, res) => {
  try {
    const { location } = req.query;
    const where = typeof location !== 'undefined'
      ? { location: ['true', '1', 'on'].includes(location) }
      : undefined;
    const ads = await AdType.findAll({ where, order: [['id', 'ASC']] });
    res.json({ ads });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении рекламы' });
  }
});

// New routes for getting lines, stations, and trains
router.get('/get-lines', async (req, res) => {
  try {
    const { Line } = require('../models');
    const lines = await Line.findAll({ 
      raw: true,
      order: [['id', 'ASC']]
    });
    
    console.log('Found lines count:', lines.length);
    console.log('Lines data:', JSON.stringify(lines, null, 2));
    
    res.json({ success: true, lines: lines || [] });
  } catch (err) {
    console.error('Error getting lines:', err);
    res.json({ success: false, message: 'Ошибка сервера: ' + err.message, lines: [] });
  }
});

router.get('/get-stations', async (req, res) => {
  try {
    const { MetroStation } = require('../models');
    const lineId = req.query.line_id;
    
    console.log('Getting stations for line_id:', lineId);
    
    if (!lineId) {
      console.log('No line_id provided');
      return res.json({ success: false, message: 'Line ID не указан', stations: [] });
    }
    
    const stations = await MetroStation.findAll({ 
      where: { line_id: lineId },
      raw: true,
      order: [['id', 'ASC']]
    });
    
    console.log('Found stations count:', stations.length);
    console.log('Stations data:', JSON.stringify(stations, null, 2));
    
    res.json({ success: true, stations: stations || [] });
  } catch (err) {
    console.error('Error getting stations:', err);
    res.json({ success: false, message: 'Ошибка сервера: ' + err.message, stations: [] });
  }
});

router.get('/get-trains', async (req, res) => {
  try {
    const { Train } = require('../models');
    const lineId = req.query.line_id;
    
    console.log('Getting trains for line_id:', lineId);
    
    if (!lineId) {
      console.log('No line_id provided');
      return res.json({ success: false, message: 'Line ID не указан', trains: [] });
    }
    
    const trains = await Train.findAll({ 
      where: { line_id: lineId },
      raw: true,
      order: [['id', 'ASC']]
    });
    
    console.log('Found trains count:', trains.length);
    console.log('Trains data:', JSON.stringify(trains, null, 2));
    
    res.json({ success: true, trains: trains || [] });
  } catch (err) {
    console.error('Error getting trains:', err);
    res.json({ success: false, message: 'Ошибка сервера: ' + err.message, trains: [] });
  }
});

// New route for order redirect
router.get('/order', (req, res) => {
  if (!req.session.user) {
    req.flash('error', 'Требуется авторизация');
    return res.redirect('/login');
  }
  res.redirect('/cabinet');
});

router.get('/get-stations-with-availability', async (req, res) => {
  try {
    const lineId = parseInt(req.query.line_id);
    const { MetroStation, AdSpace } = require('../models');

    console.log('=== GET STATIONS WITH AVAILABILITY ===');
    console.log('Line ID:', lineId);

    if (!lineId || isNaN(lineId)) {
      return res.json({ success: false, message: 'Line ID не указан' });
    }

    // Получаем все станции на этой линии
    const stations = await MetroStation.findAll({
      where: { line_id: lineId },
      raw: true
    });

    console.log('Found stations on line:', stations.length);

    if (stations.length === 0) {
      return res.json({ success: true, stations: [] });
    }

    // Для каждой станции проверяем наличие доступных мест
    const stationsWithAvailability = [];
    
    for (const station of stations) {
      const availableCount = await AdSpace.count({
        where: {
          station_id: station.id,
          availability: true
        }
      });

      console.log(`Station ${station.id} (${station.name}): ${availableCount} available spaces`);

      // Добавляем только если есть доступные места
      if (availableCount > 0) {
        stationsWithAvailability.push(station);
      }
    }

    console.log('Stations with availability:', stationsWithAvailability.length);

    res.json({ success: true, stations: stationsWithAvailability });
  } catch (err) {
    console.error('Error in get-stations-with-availability:', err);
    res.json({ success: false, message: 'Ошибка сервера' });
  }
});

module.exports = router;
