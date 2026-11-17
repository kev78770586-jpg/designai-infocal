/**
 * Adaptador Serverless para Netlify Functions
 * DesignAI - INFOCAL Santa Cruz
 */
const serverless = require('serverless-http');
const app = require('../../server');

// Envolver Express para ejecución Serverless en AWS Lambda / Netlify
const handler = serverless(app, {
  binary: ['image/jpeg', 'image/png', 'image/webp', 'multipart/form-data']
});

let isSynced = false;

module.exports.handler = async (event, context) => {
  // Evitar esperar por conexiones abiertas en el pool
  context.callbackWaitsForEmptyEventLoop = false;

  // Sincronizar automáticamente las tablas si no se ha hecho
  if (!isSynced) {
    try {
      const { sequelize } = require('../../models');
      await sequelize.authenticate();
      await sequelize.sync();
      isSynced = true;
    } catch (e) {
      // Continuar incluso si la DB tarda en responder
    }
  }

  return await handler(event, context);
};
