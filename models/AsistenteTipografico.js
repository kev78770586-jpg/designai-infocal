const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AsistenteTipografico = sequelize.define('AsistenteTipografico', {
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
  tipo_proyecto: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  estilo_deseado: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  imagen_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  fuente_titulo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  fuente_cuerpo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  fuente_acento: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  justificacion_combinacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reglas_jerarquia: {
    type: DataTypes.JSON,
    allowNull: true
  },
  enlaces_google_fonts: {
    type: DataTypes.JSON,
    allowNull: true
  },
  resultado_json: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  tableName: 'asistente_tipografico',
  timestamps: true,
  underscored: true,
  createdAt: 'creado_en',
  updatedAt: false
});

module.exports = AsistenteTipografico;
