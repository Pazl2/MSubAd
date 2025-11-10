const express = require('express');
const { Line, MetroStation, AdType } = require('../models');
const router = express.Router();

// main catalog page - overview lines
router.get('/', async (req, res) => {
  const lines = await Line.findAll({ order: [['id','ASC']] });
  res.render('catalog', { lines, title: 'Обзор станций', selectedAds: false, stations: null, station: null, selectedLine: null, ads: null });
});

// view line
router.get('/line/:id', async (req, res) => {
  const id = req.params.id;
  const line = await Line.findByPk(id);
  if (!line) {
    return res.render('catalog', { error: 'Линия не найдена', lines: await Line.findAll({ order: [['id','ASC']] }), title: 'Обзор станций', selectedAds: false });
  }
  const stations = await MetroStation.findAll({ where: { line_id: line.id }, order: [['id','ASC']] });
  const lines = await Line.findAll({ order: [['id','ASC']] });
  res.render('catalog', { lines, stations, selectedLine: line, title: line.name, selectedAds: false, station: null, ads: null });
});

// view station
router.get('/station/:id', async (req, res) => {
  const id = req.params.id;
  const station = await MetroStation.findByPk(id, { include: Line });
  if (!station) {
    return res.render('catalog', { error: 'Станция не найдена', lines: await Line.findAll({ order: [['id','ASC']] }), title: 'Обзор станций', selectedAds: false });
  }
  const lines = await Line.findAll({ order: [['id','ASC']] });
  res.render('catalog', { lines, station, title: station.name, selectedAds: false, stations: null, selectedLine: null, ads: null });
});

// view ads with optional filter ?location=true/false
// This route also supports AJAX: if Accept: application/json -> returns JSON
router.get('/ads', async (req, res) => {
  const locationParam = req.query.location;
  let ads;
  if (typeof locationParam !== 'undefined') {
    const loc = (locationParam === 'true' || locationParam === '1' || locationParam === 'on');
    ads = await AdType.findAll({ where: { location: loc }, order: [['id', 'ASC']] });
  } else {
    ads = await AdType.findAll({ order: [['id','ASC']] });
  }
  const lines = await Line.findAll({ order: [['id','ASC']] });
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.json({ ads });
  }
  res.render('catalog', { ads, selectedAds: true, lines, title: 'Реклама', stations: null, station: null, selectedLine: null });
});

module.exports = router;
