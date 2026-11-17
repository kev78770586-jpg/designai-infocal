const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Proyecto = sequelize.define('Proyecto', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoria: {
    type: DataTypes.ENUM('editorial', 'publicidad', 'branding', 'ui_ux', 'ilustracion', 'otro'),
    defaultValue: 'editorial',
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('activo', 'completado', 'archivado'),
    defaultValue: 'activo'
  }
}, {
  tableName: 'proyectos',
  timestamps: true,
  underscored: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en'
});

module.exports = Proyecto;
