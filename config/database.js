'use strict';

require('dotenv').config();

module.exports = {
  development: {
    dialect: 'mysql',
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    logging: false,
    operatorsAliases: false,
    // On my machine SQL performed around 1,000 files in 70 seconds
    // dialect: 'sqlite',
    // storage: process.env.TEST_SQLITE_FILE || __dirname + '/../data/development.sqlite',
  },
  test: {
    dialect: 'sqlite',
    storage: process.env.TEST_SQLITE_FILE || __dirname + '/../data/test.sqlite',
    logging: console.log,
    operatorsAliases: false,
  },
  production: {
    dialect: 'mysql',
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    logging: false,
    operatorsAliases: false,
    // On my machine SQL performed around 1,000 files in 70 seconds
    // dialect: 'sqlite',
    // storage: process.env.TEST_SQLITE_FILE || __dirname + '/../data/production.sqlite',
  }
};
