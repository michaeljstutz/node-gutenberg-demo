'use strict';

require('dotenv').config();

const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.simple(),
    winston.format.splat(),
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf(info => {
      return `[${info.timestamp}] ${info.level}: ${info.message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
  ]
});

module.exports = logger;