'use strict';

require("dotenv").config();
const localeList = require('../api/data/locales.json');

const { 
  DB_USER, 
  DB_PASSWORD, 
  DB_HOST, 
  DB_PORT, 
  DB_NAME,
  APP_PORT,
  APP_NAME
} = process.env;

module.exports = {
  serviceName: APP_NAME,
  mongodb: {
    user: DB_USER,
    pass: DB_PASSWORD
  },
  baseUri: `http://localhost:${APP_PORT}`,
  corsWhitelist: ['http://localhost:4208', 'http://127.0.0.1:4208'],
  dbUri: `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`,
  dbAuthenticatedUri: `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
  appPort: APP_PORT,
  i18nConfig: {
    locales: ['en-US', 'fi-FI'],
    localeList: localeList,
    directory: './api/locales',
    defaultLocale: 'en-US',
    updateFiles: false,
    objectNotation: true,
    retryInDefaultLocale: true,
    fallbacks: {
      en: 'en-US',
      fi: 'fi-FI'
    }
  },
  jwtAppToken: {
    secret: 'Your secret key',
    algorithm: 'HS512',
    expiresIn: 60 * 60 * 24, // 1 day
    version: 1
  },
  sendgrid: {
    apiKey: 'YOUR_SENDGRID_API_KEY',
    fromEmail: 'YOUR_EMAIL_ADDRESS',
    templateId: 'YOUR_SENDGRID_TEMPLATE_ID',
    whitelabelImageUrl: 'YOUR_IMAGE_URL'
  }
};
