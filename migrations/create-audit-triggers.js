'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Создаем таблицу audit_logs
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      table_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      operation: {
        type: Sequelize.ENUM('INSERT', 'UPDATE', 'DELETE'),
        allowNull: false
      },
      record_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      old_values: {
        type: Sequelize.JSON,
        allowNull: true
      },
      new_values: {
        type: Sequelize.JSON,
        allowNull: true
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      }
    });

    // Триггер для Users (INSERT)
    await queryInterface.sequelize.query(`
      CREATE TRIGGER users_insert_trigger
      AFTER INSERT ON users
      FOR EACH ROW
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, new_values, timestamp)
        VALUES ('users', 'INSERT', NEW.id, JSON_OBJECT(
          'id', NEW.id,
          'username', NEW.username,
          'first_name', NEW.first_name,
          'last_name', NEW.last_name,
          'email', NEW.email,
          'is_moder', NEW.is_moder
        ), NOW());
      END
    `);

    // Триггер для Users (UPDATE)
    await queryInterface.sequelize.query(`
      CREATE TRIGGER users_update_trigger
      AFTER UPDATE ON users
      FOR EACH ROW
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, old_values, new_values, timestamp)
        VALUES ('users', 'UPDATE', NEW.id, JSON_OBJECT(
          'id', OLD.id,
          'username', OLD.username,
          'first_name', OLD.first_name,
          'last_name', OLD.last_name,
          'email', OLD.email,
          'is_moder', OLD.is_moder
        ), JSON_OBJECT(
          'id', NEW.id,
          'username', NEW.username,
          'first_name', NEW.first_name,
          'last_name', NEW.last_name,
          'email', NEW.email,
          'is_moder', NEW.is_moder
        ), NOW());
      END
    `);

    // Триггер для Users (DELETE)
    await queryInterface.sequelize.query(`
      CREATE TRIGGER users_delete_trigger
      AFTER DELETE ON users
      FOR EACH ROW
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, old_values, timestamp)
        VALUES ('users', 'DELETE', OLD.id, JSON_OBJECT(
          'id', OLD.id,
          'username', OLD.username,
          'first_name', OLD.first_name,
          'last_name', OLD.last_name,
          'email', OLD.email,
          'is_moder', OLD.is_moder
        ), NOW());
      END
    `);

    // Триггер для AdType (INSERT)
    await queryInterface.sequelize.query(`
      CREATE TRIGGER ad_types_insert_trigger
      AFTER INSERT ON ad_types
      FOR EACH ROW
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, new_values, timestamp)
        VALUES ('ad_types', 'INSERT', NEW.id, JSON_OBJECT(
          'id', NEW.id,
          'name', NEW.name,
          'description', NEW.description,
          'width', NEW.width,
          'height', NEW.height,
          'base_price', NEW.base_price
        ), NOW());
      END
    `);

    // Триггер для AdType (UPDATE)
    await queryInterface.sequelize.query(`
      CREATE TRIGGER ad_types_update_trigger
      AFTER UPDATE ON ad_types
      FOR EACH ROW
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, old_values, new_values, timestamp)
        VALUES ('ad_types', 'UPDATE', NEW.id, JSON_OBJECT(
          'id', OLD.id,
          'name', OLD.name,
          'description', OLD.description,
          'base_price', OLD.base_price
        ), JSON_OBJECT(
          'id', NEW.id,
          'name', NEW.name,
          'description', NEW.description,
          'base_price', NEW.base_price
        ), NOW());
      END
    `);

    // Триггер для AdType (DELETE)
    await queryInterface.sequelize.query(`
      CREATE TRIGGER ad_types_delete_trigger
      AFTER DELETE ON ad_types
      FOR EACH ROW
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, old_values, timestamp)
        VALUES ('ad_types', 'DELETE', OLD.id, JSON_OBJECT(
          'id', OLD.id,
          'name', OLD.name,
          'description', OLD.description,
          'base_price', OLD.base_price
        ), NOW());
      END
    `);

    // Триггер для AdSpaces (INSERT)
    await queryInterface.sequelize.query(`
      CREATE TRIGGER ad_spaces_insert_trigger
      AFTER INSERT ON ad_spaces
      FOR EACH ROW
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, new_values, timestamp)
        VALUES ('ad_spaces', 'INSERT', NEW.id, JSON_OBJECT(
          'id', NEW.id,
          'type_id', NEW.type_id,
          'station_id', NEW.station_id,
          'train_id', NEW.train_id,
          'availability', NEW.availability
        ), NOW());
      END
    `);

    // Триггер для AdSpaces (DELETE)
    await queryInterface.sequelize.query(`
      CREATE TRIGGER ad_spaces_delete_trigger
      AFTER DELETE ON ad_spaces
      FOR EACH ROW
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, old_values, timestamp)
        VALUES ('ad_spaces', 'DELETE', OLD.id, JSON_OBJECT(
          'id', OLD.id,
          'type_id', OLD.type_id,
          'station_id', OLD.station_id,
          'train_id', OLD.train_id
        ), NOW());
      END
    `);

    // Триггер для Templates (INSERT)
    await queryInterface.sequelize.query(`
      CREATE TRIGGER templates_insert_trigger
      AFTER INSERT ON templates
      FOR EACH ROW
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, new_values, timestamp)
        VALUES ('templates', 'INSERT', NEW.id, JSON_OBJECT(
          'id', NEW.id,
          'user_id', NEW.user_id,
          'type_id', NEW.type_id,
          'ad_title', NEW.ad_title,
          'approval_status', NEW.approval_status
        ), NOW());
      END
    `);

    // Триггер для Templates (UPDATE)
    await queryInterface.sequelize.query(`
      CREATE TRIGGER templates_update_trigger
      AFTER UPDATE ON templates
      FOR EACH ROW
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, old_values, new_values, timestamp)
        VALUES ('templates', 'UPDATE', NEW.id, JSON_OBJECT(
          'approval_status', OLD.approval_status,
          'moder_id', OLD.moder_id
        ), JSON_OBJECT(
          'approval_status', NEW.approval_status,
          'moder_id', NEW.moder_id
        ), NOW());
      END
    `);

    // Триггер для Templates (DELETE)
    await queryInterface.sequelize.query(`
      CREATE TRIGGER templates_delete_trigger
      AFTER DELETE ON templates
      FOR EACH ROW
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, old_values, timestamp)
        VALUES ('templates', 'DELETE', OLD.id, JSON_OBJECT(
          'id', OLD.id,
          'user_id', OLD.user_id,
          'ad_title', OLD.ad_title
        ), NOW());
      END
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Удаляем триггеры
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS users_insert_trigger');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS users_update_trigger');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS users_delete_trigger');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS ad_types_insert_trigger');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS ad_types_update_trigger');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS ad_types_delete_trigger');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS ad_spaces_insert_trigger');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS ad_spaces_delete_trigger');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS templates_insert_trigger');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS templates_update_trigger');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS templates_delete_trigger');
    
    // Удаляем таблицу
    await queryInterface.dropTable('audit_logs');
  }
};
