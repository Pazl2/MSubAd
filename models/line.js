module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Line', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    color_code: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'lines',
    timestamps: false
  });
};

