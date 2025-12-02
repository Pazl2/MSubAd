const sequelize = require('../config/db');

async function initTriggers() {
  try {
    console.log('Инициализация триггеров для аудита...');

    // Создаем функцию для логирования INSERT в users
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION log_user_insert()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, new_values, timestamp)
        VALUES ('users', 'INSERT', NEW.id, jsonb_build_object(
          'id', NEW.id,
          'username', NEW.username,
          'first_name', NEW.first_name,
          'last_name', NEW.last_name,
          'email', NEW.email,
          'is_moder', NEW.is_moder
        ), NOW());
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✓ Функция log_user_insert создана');

    // Триггер для Users (INSERT)
    await sequelize.query(`
      DROP TRIGGER IF EXISTS users_insert_trigger ON users;
      CREATE TRIGGER users_insert_trigger
      AFTER INSERT ON users
      FOR EACH ROW
      EXECUTE FUNCTION log_user_insert();
    `);
    console.log('✓ Триггер users_insert_trigger создан');

    // Создаем функцию для логирования UPDATE в users
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION log_user_update()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, old_values, new_values, timestamp)
        VALUES ('users', 'UPDATE', NEW.id, jsonb_build_object(
          'id', OLD.id,
          'username', OLD.username,
          'first_name', OLD.first_name,
          'last_name', OLD.last_name,
          'email', OLD.email,
          'is_moder', OLD.is_moder
        ), jsonb_build_object(
          'id', NEW.id,
          'username', NEW.username,
          'first_name', NEW.first_name,
          'last_name', NEW.last_name,
          'email', NEW.email,
          'is_moder', NEW.is_moder
        ), NOW());
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✓ Функция log_user_update создана');

    // Триггер для Users (UPDATE)
    await sequelize.query(`
      DROP TRIGGER IF EXISTS users_update_trigger ON users;
      CREATE TRIGGER users_update_trigger
      AFTER UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION log_user_update();
    `);
    console.log('✓ Триггер users_update_trigger создан');

    // Создаем функцию для логирования DELETE в users
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION log_user_delete()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, old_values, timestamp)
        VALUES ('users', 'DELETE', OLD.id, jsonb_build_object(
          'id', OLD.id,
          'username', OLD.username,
          'first_name', OLD.first_name,
          'last_name', OLD.last_name,
          'email', OLD.email,
          'is_moder', OLD.is_moder
        ), NOW());
        RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✓ Функция log_user_delete создана');

    // Триггер для Users (DELETE)
    await sequelize.query(`
      DROP TRIGGER IF EXISTS users_delete_trigger ON users;
      CREATE TRIGGER users_delete_trigger
      AFTER DELETE ON users
      FOR EACH ROW
      EXECUTE FUNCTION log_user_delete();
    `);
    console.log('✓ Триггер users_delete_trigger создан');

    // AdType триггеры
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION log_ad_type_insert()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, new_values, timestamp)
        VALUES ('ad_types', 'INSERT', NEW.id, jsonb_build_object(
          'id', NEW.id,
          'name', NEW.name,
          'description', NEW.description,
          'width', NEW.width,
          'height', NEW.height,
          'base_price', NEW.base_price
        ), NOW());
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await sequelize.query(`
      DROP TRIGGER IF EXISTS ad_types_insert_trigger ON ad_types;
      CREATE TRIGGER ad_types_insert_trigger
      AFTER INSERT ON ad_types
      FOR EACH ROW
      EXECUTE FUNCTION log_ad_type_insert();
    `);
    console.log('✓ Триггер ad_types_insert_trigger создан');

    await sequelize.query(`
      CREATE OR REPLACE FUNCTION log_ad_type_update()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, old_values, new_values, timestamp)
        VALUES ('ad_types', 'UPDATE', NEW.id, jsonb_build_object(
          'id', OLD.id,
          'name', OLD.name,
          'base_price', OLD.base_price
        ), jsonb_build_object(
          'id', NEW.id,
          'name', NEW.name,
          'base_price', NEW.base_price
        ), NOW());
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await sequelize.query(`
      DROP TRIGGER IF EXISTS ad_types_update_trigger ON ad_types;
      CREATE TRIGGER ad_types_update_trigger
      AFTER UPDATE ON ad_types
      FOR EACH ROW
      EXECUTE FUNCTION log_ad_type_update();
    `);
    console.log('✓ Триггер ad_types_update_trigger создан');

    await sequelize.query(`
      CREATE OR REPLACE FUNCTION log_ad_type_delete()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, old_values, timestamp)
        VALUES ('ad_types', 'DELETE', OLD.id, jsonb_build_object(
          'id', OLD.id,
          'name', OLD.name,
          'base_price', OLD.base_price
        ), NOW());
        RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await sequelize.query(`
      DROP TRIGGER IF EXISTS ad_types_delete_trigger ON ad_types;
      CREATE TRIGGER ad_types_delete_trigger
      AFTER DELETE ON ad_types
      FOR EACH ROW
      EXECUTE FUNCTION log_ad_type_delete();
    `);
    console.log('✓ Триггер ad_types_delete_trigger создан');

    // AdSpace триггеры
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION log_ad_space_insert()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, new_values, timestamp)
        VALUES ('ad_space', 'INSERT', NEW.id, jsonb_build_object(
          'id', NEW.id,
          'type_id', NEW.type_id,
          'station_id', NEW.station_id,
          'train_id', NEW.train_id,
          'availability', NEW.availability
        ), NOW());
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await sequelize.query(`
      DROP TRIGGER IF EXISTS ad_spaces_insert_trigger ON ad_space;
      CREATE TRIGGER ad_spaces_insert_trigger
      AFTER INSERT ON ad_space
      FOR EACH ROW
      EXECUTE FUNCTION log_ad_space_insert();
    `);
    console.log('✓ Триггер ad_spaces_insert_trigger создан');

    await sequelize.query(`
      CREATE OR REPLACE FUNCTION log_ad_space_delete()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, old_values, timestamp)
        VALUES ('ad_space', 'DELETE', OLD.id, jsonb_build_object(
          'id', OLD.id,
          'type_id', OLD.type_id,
          'station_id', OLD.station_id,
          'train_id', OLD.train_id
        ), NOW());
        RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await sequelize.query(`
      DROP TRIGGER IF EXISTS ad_spaces_delete_trigger ON ad_space;
      CREATE TRIGGER ad_spaces_delete_trigger
      AFTER DELETE ON ad_space
      FOR EACH ROW
      EXECUTE FUNCTION log_ad_space_delete();
    `);
    console.log('✓ Триггер ad_spaces_delete_trigger создан');

    // Template триггеры
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION log_template_insert()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, new_values, timestamp)
        VALUES ('templates', 'INSERT', NEW.id, jsonb_build_object(
          'id', NEW.id,
          'user_id', NEW.user_id,
          'type_id', NEW.type_id,
          'ad_title', NEW.ad_title,
          'approval_status', NEW.approval_status
        ), NOW());
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await sequelize.query(`
      DROP TRIGGER IF EXISTS templates_insert_trigger ON templates;
      CREATE TRIGGER templates_insert_trigger
      AFTER INSERT ON templates
      FOR EACH ROW
      EXECUTE FUNCTION log_template_insert();
    `);
    console.log('✓ Триггер templates_insert_trigger создан');

    await sequelize.query(`
      CREATE OR REPLACE FUNCTION log_template_update()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, old_values, new_values, timestamp)
        VALUES ('templates', 'UPDATE', NEW.id, jsonb_build_object(
          'approval_status', OLD.approval_status,
          'moder_id', OLD.moder_id
        ), jsonb_build_object(
          'approval_status', NEW.approval_status,
          'moder_id', NEW.moder_id
        ), NOW());
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await sequelize.query(`
      DROP TRIGGER IF EXISTS templates_update_trigger ON templates;
      CREATE TRIGGER templates_update_trigger
      AFTER UPDATE ON templates
      FOR EACH ROW
      EXECUTE FUNCTION log_template_update();
    `);
    console.log('✓ Триггер templates_update_trigger создан');

    await sequelize.query(`
      CREATE OR REPLACE FUNCTION log_template_delete()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO audit_logs (table_name, operation, record_id, old_values, timestamp)
        VALUES ('templates', 'DELETE', OLD.id, jsonb_build_object(
          'id', OLD.id,
          'user_id', OLD.user_id,
          'ad_title', OLD.ad_title
        ), NOW());
        RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await sequelize.query(`
      DROP TRIGGER IF EXISTS templates_delete_trigger ON templates;
      CREATE TRIGGER templates_delete_trigger
      AFTER DELETE ON templates
      FOR EACH ROW
      EXECUTE FUNCTION log_template_delete();
    `);
    console.log('✓ Триггер templates_delete_trigger создан');

    console.log('\n✅ Все триггеры успешно созданы!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка при создании триггеров:', err.message);
    process.exit(1);
  }
}

initTriggers();
