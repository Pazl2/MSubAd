// models/template.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Template', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    type_id: { type: DataTypes.BIGINT, allowNull: false },
    ad_title: { type: DataTypes.STRING, allowNull: false },
    content_url: { type: DataTypes.STRING, allowNull: true },
    upload_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    approval_status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
    moder_id: { type: DataTypes.BIGINT, allowNull: true },
    approval_date: { type: DataTypes.DATE, allowNull: true },
    rejection_reason: { type: DataTypes.STRING, allowNull: true }
  }, {
    tableName: 'templates',
    timestamps: false
  });
};