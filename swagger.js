const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'GAMEDOMINATE+ API',
    description: 'API for the GAMEDOMINATE+'
  },
  host: 'dominate-game-backend-v2.onrender',
  schemes: ['http']
};

const outputFile = './swagger-output.json';
const routes = ['./src/index.js'];

swaggerAutogen(outputFile, routes, doc);
