const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistorialActividad = sequelize.define('HistorialActividad', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  modulo: {
    type: DataTypes.ENUM('analizador', 'colores', 'tipografia', 'ideas', 'ui_ux', 'proyecto', 'autenticacion'),
    allowNull: false
  },
  accion: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  referencia_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  metadatos: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'historial_actividad',
  timestamps: true,
  underscored: true,
  createdAt: 'creado_en',
  updatedAt: false
});

module.exports = HistorialActividad;
