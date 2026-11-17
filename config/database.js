const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Conexión a Base de Datos MySQL con Sequelize
 * DesignAI - INFOCAL Santa Cruz
 * Soporta conexión por URL directa (Railway/Render) o por variables individuales (Local/Docker)
 */
const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

const sequelize = dbUrl
  ? new Sequelize(dbUrl, {
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true,
        createdAt: 'creado_en',
        updatedAt: 'actualizado_en'
      }
    })
  : new Sequelize(
      process.env.DB_NAME || 'designai_db',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        dialect: 'mysql',
        logging: false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        define: {
          timestamps: true,
          underscored: true,
          createdAt: 'creado_en',
          updatedAt: 'actualizado_en'
        }
      }
    );

module.exports = sequelize;
