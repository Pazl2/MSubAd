const { Sequelize } = require('sequelize');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:3049@localhost:5432/msubad_db1';

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.SEQ_LOG === 'true' ? console.log : false,
});

module.exports = sequelize;
