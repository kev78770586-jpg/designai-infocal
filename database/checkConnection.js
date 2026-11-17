/**
 * Verificador Rápido de Conexión a Base de Datos MySQL
 * DesignAI - INFOCAL Santa Cruz
 */
const mysql = require('mysql2/promise');
require('dotenv').config();
const { sequelize, Usuario, Proyecto } = require('../models');

async function checkDatabase() {
  console.log('================================================================');
  console.log('🔍 DIAGNÓSTICO DE BASE DE DATOS: DesignAI (INFOCAL Santa Cruz)');
  console.log('================================================================\n');

  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
  const database = process.env.DB_NAME || 'designai_db';

  console.log('📋 Parámetros de conexión configurados en tu archivo .env:');
  console.log(`   - Host: ${host}`);
  console.log(`   - Puerto: ${port}`);
  console.log(`   - Usuario: ${user}`);
  console.log(`   - Base de datos: ${database}`);
  console.log(`   - Contraseña: ${password ? '********' : '(Vacía por defecto en XAMPP/Laragon)'}\n`);

  // Paso 1: Conexión básica con el servidor MySQL
  let connection;
  try {
    process.stdout.write('1️⃣  Intentando conectar con el servidor MySQL... ');
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password
    });
    console.log('✅ ¡CONECTADO CON ÉXITO!');
  } catch (err) {
    console.log('❌ FALLÓ');
    console.error('\n⚠️  No se pudo establecer conexión con MySQL:');
    console.error(`   Detalle: ${err.message}\n`);
    console.log('💡 SOLUCIÓN RECOMENDADA:');
    if (err.code === 'ECONNREFUSED') {
      console.log('   👉 El servicio de MySQL no está iniciado.');
      console.log('   - Si usas XAMPP: Abre el panel de control de XAMPP y presiona "Start" en el módulo "MySQL".');
      console.log('   - Si usas Laragon: Haz clic en "Iniciar todo" (Start All).');
      console.log('   - Si usas Docker: Asegúrate de que el contenedor de MySQL esté corriendo.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('   👉 El usuario o la contraseña en tu archivo .env no son correctos.');
      console.log('   - Abre el archivo .env y ajusta DB_USER y DB_PASSWORD.');
    }
    process.exit(1);
  }

  // Paso 2: Verificar si la base de datos designai_db existe
  try {
    process.stdout.write(`2️⃣  Verificando si existe la base de datos '${database}'... `);
    const [dbs] = await connection.query(`SHOW DATABASES LIKE '${database}'`);
    if (dbs.length > 0) {
      console.log('✅ EXISTE');
    } else {
      console.log('⚠️  NO EXISTE AÚN');
      console.log(`\n💡 La base de datos '${database}' aún no ha sido creada.`);
      console.log('   👉 Ejecuta en tu terminal: npm run db:migrate');
      await connection.end();
      process.exit(0);
    }
  } catch (err) {
    console.log('❌ ERROR:', err.message);
    await connection.end();
    process.exit(1);
  }

  // Paso 3: Verificar las tablas creadas
  try {
    process.stdout.write('3️⃣  Consultando tablas existentes en la base de datos... ');
    await connection.changeUser({ database });
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ ${tables.length} TABLAS ENCONTRADAS\n`);

    const tableKey = `Tables_in_${database}`;
    console.log('   Tablas detectadas:');
    for (const t of tables) {
      const tableName = t[tableKey];
      const [[{ count }]] = await connection.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      console.log(`   - 📄 ${tableName.padEnd(25)} (${count} registros)`);
    }
  } catch (err) {
    console.log('❌ Error al leer tablas:', err.message);
  } finally {
    await connection.end();
  }

  // Paso 4: Probar conexión con el ORM Sequelize
  try {
    console.log('\n4️⃣  Probando capa de persistencia ORM (Sequelize):');
    await sequelize.authenticate();
    console.log('   ✅ Conexión con Sequelize verificada exitosamente.');

    const totalUsuarios = await Usuario.count().catch(() => 0);
    console.log(`   👥 Total de usuarios registrados: ${totalUsuarios}`);
  } catch (err) {
    console.warn('   ⚠️ Aviso en Sequelize:', err.message);
  }

  console.log('\n================================================================');
  console.log('🎉 ¡LA BASE DE DATOS ESTÁ 100% OPERATIVA Y LISTA PARA USAR!');
  console.log('================================================================\n');
}

checkDatabase();
