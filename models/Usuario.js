const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre_completo: {
    type: DataTypes.VARCHAR ? DataTypes.STRING(150) : DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('estudiante', 'docente', 'administrador'),
    defaultValue: 'estudiante',
    allowNull: false
  },
  matricula: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  carrera: {
    type: DataTypes.STRING(100),
    defaultValue: 'Diseño Gráfico y Comunicación Visual'
  },
  avatar_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  underscored: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en'
});

module.exports = Usuario;
