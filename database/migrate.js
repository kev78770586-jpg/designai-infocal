/**
 * Script de migración y creación de Base de Datos para DesignAI
 * INFOCAL Santa Cruz - Carrera de Diseño Gráfico
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  console.log('====================================================');
  console.log('🚀 DesignAI - Inicializador de Base de Datos MySQL');
  console.log('   INFOCAL Santa Cruz');
  console.log('====================================================');

  const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';

  try {
    let connection;
    if (dbUrl) {
      console.log(`📡 Conectando a MySQL mediante URL de conexión remota...`);
      connection = await mysql.createConnection({
        uri: dbUrl,
        multipleStatements: true
      });
    } else {
      console.log(`📡 Conectando a MySQL en ${host}:${port} como '${user}'...`);
      connection = await mysql.createConnection({
        host,
        port,
        user,
        password,
        multipleStatements: true
      });
    }

    console.log('✅ Conexión establecida con éxito.');

    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log(`📄 Leyendo script SQL: ${schemaPath}...`);
    const sqlScript = fs.readFileSync(schemaPath, 'utf8');

    console.log('⚙️  Ejecutando script SQL para crear `designai_db` y sus tablas...');
    await connection.query(sqlScript);

    console.log('🎉 Base de datos y tablas creadas exitosamente.');
    console.log('📊 Tablas configuradas:');
    console.log('   - usuarios');
    console.log('   - proyectos');
    console.log('   - analisis_diseno (Módulo 1: Analizador)');
    console.log('   - paletas_colores (Módulo 2: Paletas)');
    console.log('   - asistente_tipografico (Módulo 3: Tipografía)');
    console.log('   - ideas_conceptos (Módulo 4: Ideas Creativas)');
    console.log('   - evaluador_uiux (Módulo 5: Evaluador UI/UX)');
    console.log('   - historial_actividad (Auditoría y Estadísticas)');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar la migración SQL:', error.message);
    console.error('Por favor verifica que el servicio de MySQL (XAMPP, WampServer, Laragon o Docker) esté activo.');
    process.exit(1);
  }
}

runMigration();
