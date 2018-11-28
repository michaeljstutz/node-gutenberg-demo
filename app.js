'use strict';

require('dotenv').config();

const logger = require('./src/logger');
const gutenbergData = require('./src/gutenberg-data');
const importData = require('./src/import-data');

logger.info('This might take a while, if you need to cancel press ctl + c');
logger.info('if you cancel during extraction do not forget to run clear:cache');

// TODO: move these params to config file/env file (maybe?)
let params = {
  gutenbergDataCheck: true,
  gutenbergDataDownload: false,
  gutenbergDataExtract: false,
  importDataProcess: true,
};

async function runApp() {
  if (params.gutenbergDataCheck) {
    logger.info('Checking gutenberg data..');
    await gutenbergData.check(params);
  }
  
  if (params.gutenbergDataDownload) {
    logger.info('Downloading gutenberg data...');
    await gutenbergData.download(params);
  }
  
  if (params.gutenbergDataExtract) {
    logger.info('Extracting gutenberg data...');
    await gutenbergData.extract(params);
  }
  
  if (params.importDataProcess) {
    logger.info('Importing data...');
    await importData.processGutenbergData(params);
  }
}

runApp().catch((err)=>{
  console.log(err);
  console.log('Something went wrong...');
}).finally(()=>{
  console.log('All done...');
  process.exit();
});

// Fix for ctr + c not stopping app when under docker
process.on('SIGINT', function() {
  process.exit();
});