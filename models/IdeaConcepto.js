const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IdeaConcepto = sequelize.define('IdeaConcepto', {
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
  prompt_idea: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  publico_meta: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  palabras_clave: {
    type: DataTypes.JSON,
    allowNull: false
  },
  propuestas_conceptuales: {
    type: DataTypes.JSON,
    allowNull: false
  },
  orientacion_cromatica: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estilo_visual_sugerido: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  resultado_json: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  tableName: 'ideas_conceptos',
  timestamps: true,
  underscored: true,
  createdAt: 'creado_en',
  updatedAt: false
});

module.exports = IdeaConcepto;
