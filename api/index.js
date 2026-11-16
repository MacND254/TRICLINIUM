const appModule = require('../apps/api/dist/app');
const app = appModule.default || appModule.app || appModule;

module.exports = app;
