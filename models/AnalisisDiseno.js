const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AnalisisDiseno = sequelize.define('AnalisisDiseno', {
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
  titulo_diseno: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  tipo_diseno: {
    type: DataTypes.ENUM('afiche', 'red_social', 'editorial', 'identidad_visual', 'packaging', 'otro'),
    defaultValue: 'afiche',
    allowNull: false
  },
  contexto_diseno: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imagen_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  puntaje_general: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true
  },
  puntaje_composicion: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true
  },
  puntaje_jerarquia: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true
  },
  puntaje_contraste: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true
  },
  analisis_composicion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  analisis_jerarquia: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  analisis_contraste: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recomendaciones_mejora: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resultado_json: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  tableName: 'analisis_diseno',
  timestamps: true,
  underscored: true,
  createdAt: 'creado_en',
  updatedAt: false
});

module.exports = AnalisisDiseno;
