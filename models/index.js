const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Proyecto = require('./Proyecto');
const AnalisisDiseno = require('./AnalisisDiseno');
const PaletaColor = require('./PaletaColor');
const AsistenteTipografico = require('./AsistenteTipografico');
const IdeaConcepto = require('./IdeaConcepto');
const EvaluadorUIUX = require('./EvaluadorUIUX');
const HistorialActividad = require('./HistorialActividad');

// ==========================================
// ASOCIACIONES Y RELACIONES ENTRE MODELOS
// ==========================================

// Relaciones de Usuario con Proyecto
Usuario.hasMany(Proyecto, { foreignKey: 'usuario_id', as: 'proyectos', onDelete: 'CASCADE' });
Proyecto.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Relaciones con AnalisisDiseno (Módulo 1)
Usuario.hasMany(AnalisisDiseno, { foreignKey: 'usuario_id', as: 'analisis_disenos', onDelete: 'CASCADE' });
AnalisisDiseno.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Proyecto.hasMany(AnalisisDiseno, { foreignKey: 'proyecto_id', as: 'analisis_disenos', onDelete: 'SET NULL' });
AnalisisDiseno.belongsTo(Proyecto, { foreignKey: 'proyecto_id', as: 'proyecto' });

// Relaciones con PaletaColor (Módulo 2)
Usuario.hasMany(PaletaColor, { foreignKey: 'usuario_id', as: 'paletas_colores', onDelete: 'CASCADE' });
PaletaColor.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Proyecto.hasMany(PaletaColor, { foreignKey: 'proyecto_id', as: 'paletas_colores', onDelete: 'SET NULL' });
PaletaColor.belongsTo(Proyecto, { foreignKey: 'proyecto_id', as: 'proyecto' });

// Relaciones con AsistenteTipografico (Módulo 3)
Usuario.hasMany(AsistenteTipografico, { foreignKey: 'usuario_id', as: 'recomendaciones_tipograficas', onDelete: 'CASCADE' });
AsistenteTipografico.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Proyecto.hasMany(AsistenteTipografico, { foreignKey: 'proyecto_id', as: 'recomendaciones_tipograficas', onDelete: 'SET NULL' });
AsistenteTipografico.belongsTo(Proyecto, { foreignKey: 'proyecto_id', as: 'proyecto' });

// Relaciones con IdeaConcepto (Módulo 4)
Usuario.hasMany(IdeaConcepto, { foreignKey: 'usuario_id', as: 'ideas_conceptos', onDelete: 'CASCADE' });
IdeaConcepto.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Proyecto.hasMany(IdeaConcepto, { foreignKey: 'proyecto_id', as: 'ideas_conceptos', onDelete: 'SET NULL' });
IdeaConcepto.belongsTo(Proyecto, { foreignKey: 'proyecto_id', as: 'proyecto' });

// Relaciones con EvaluadorUIUX (Módulo 5)
Usuario.hasMany(EvaluadorUIUX, { foreignKey: 'usuario_id', as: 'evaluaciones_uiux', onDelete: 'CASCADE' });
EvaluadorUIUX.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Proyecto.hasMany(EvaluadorUIUX, { foreignKey: 'proyecto_id', as: 'evaluaciones_uiux', onDelete: 'SET NULL' });
EvaluadorUIUX.belongsTo(Proyecto, { foreignKey: 'proyecto_id', as: 'proyecto' });

// Relaciones con HistorialActividad
Usuario.hasMany(HistorialActividad, { foreignKey: 'usuario_id', as: 'historial', onDelete: 'CASCADE' });
HistorialActividad.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

module.exports = {
  sequelize,
  Usuario,
  Proyecto,
  AnalisisDiseno,
  PaletaColor,
  AsistenteTipografico,
  IdeaConcepto,
  EvaluadorUIUX,
  HistorialActividad
};
