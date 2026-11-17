const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaletaColor = sequelize.define('PaletaColor', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  proyecto_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  nombre_paleta: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  concepto: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  publico_objetivo: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  emocion_estilo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  imagen_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  colores_hex_rgb: {
    type: DataTypes.JSON,
    allowNull: false
  },
  evaluacion_wcag: {
    type: DataTypes.JSON,
    allowNull: false
  },
  consejos_aplicacion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'paletas_colores',
  timestamps: true,
  underscored: true,
  createdAt: 'creado_en',
  updatedAt: false
});

module.exports = PaletaColor;
