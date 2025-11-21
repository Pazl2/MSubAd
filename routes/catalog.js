// routes/catalog.js
const express = require('express');
const { Line, MetroStation, AdType } = require('../models');
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

module.exports = router;
