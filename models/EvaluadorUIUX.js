const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EvaluadorUIUX = sequelize.define('EvaluadorUIUX', {
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
  titulo_pantalla: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  tipo_dispositivo: {
    type: DataTypes.ENUM('mobile', 'desktop', 'tablet', 'dashboard'),
    defaultValue: 'mobile',
    allowNull: false
  },
  imagen_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  puntaje_usabilidad: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true
  },
  evaluacion_distribucion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  evaluacion_legibilidad: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  evaluacion_accesibilidad: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  hallazgos_heuristica: {
    type: DataTypes.JSON,
    allowNull: false
  },
  recomendaciones_ux: {
    type: DataTypes.JSON,
    allowNull: false
  },
  resultado_json: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  tableName: 'evaluador_uiux',
  timestamps: true,
  underscored: true,
  createdAt: 'creado_en',
  updatedAt: false
});

module.exports = EvaluadorUIUX;
