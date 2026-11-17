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

module.exports.handler = async (event, context) => {
  // Asegurar que context no espere el cierre del event loop si MySQL mantiene el pool abierto
  context.callbackWaitsForEmptyEventLoop = false;
  return await handler(event, context);
};
