const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Rental', {
    id: { 
      type: DataTypes.BIGINT, 
      primaryKey: true, 
      autoIncrement: true 
    },
    space_id: { 
      type: DataTypes.BIGINT, 
      allowNull: false,
      references: {
        model: 'ad_space',
        key: 'id'
      }
    },
    ad_id: { 
      type: DataTypes.BIGINT, 
      allowNull: false,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    start_date: { 
      type: DataTypes.DATE, 
      allowNull: false 
    },
    end_date: { 
      type: DataTypes.DATE, 
      allowNull: false 
    },
    total_price: { 
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: false 
    },
    status: { 
      type: DataTypes.ENUM('pending', 'active', 'completed'), 
      allowNull: false, 
      defaultValue: 'pending' 
    },
    contract_number: { 
      type: DataTypes.STRING(50), 
      allowNull: true,
      unique: true
    }
  }, {
    tableName: 'rentals',
    timestamps: false
  });
};
