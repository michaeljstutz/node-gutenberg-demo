'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const fs = require('fs');

const logger = require('./logger');

const DEFAULT_LOCAL_GUTENBERG_PATH = __dirname + '/../data/gutenberg/data.tar.bz2';
const DEFAULT_LOCAL_EXTRACT_PATH = __dirname + '/../data/gutenberg/';
const DEFAULT_LOCAL_CACHE_TIME = 86400000;

let gutenbergData = {};

gutenbergData.check = async (params) => {
  // Check to see if params where passed
  if (_.isNil(params)) throw new Error('Missing parameter');
  
  // Set defaults
  params.gutenbergDataDownload = false;
  params.gutenbergDataExtract = false;
  
  // Get the local gutenburg path
  params.localGutenbergPath = params.localGutenbergPath || DEFAULT_LOCAL_GUTENBERG_PATH;

  // Get the local extract path
  params.localExtractPath = params.localExtractPath || DEFAULT_LOCAL_EXTRACT_PATH;
  
  // Check to see if the local file exists
  if (!fs.existsSync(params.localGutenbergPath)) {
    logger.info('gutenbergData.check() data file does not exists, we need to download it');
    params.gutenbergDataDownload = true;
    return Promise.resolve(params);
  }
  
  // Return a Promise
  return new Promise((resolve, reject)=>{
    
    // Get the file stats for checking the modified time
    fs.stat(params.localGutenbergPath, function(err, stat) {
      if(err) return reject(err);

      let now = new Date().getTime();
      params.localCacheTime = params.localCacheTime || DEFAULT_LOCAL_CACHE_TIME;
      let expiresAt = new Date(stat.mtime).getTime() + params.localCacheTime;
      
      // Check to see if the current local file cache has expired
      if (now > expiresAt) {
        logger.info('Cached file is older then ' + params.localCacheTime + 'ms, we need to download');
        params.gutenbergDataDownload = true;
      } else {
        logger.info('Cached file is newer then ' + params.localCacheTime + 'ms, no need to download');
        params.gutenbergDataDownload = false;
        if (!fs.existsSync(params.localExtractPath + '/cache/')) {
          logger.info('Extract path does not exists so we will need to extract');
          params.gutenbergDataExtract = true;
        }
      }
      
      return resolve(params);
    });
  });
};

gutenbergData.download = async (params) => {
  // Only require if download is needed
  const axios = require('axios');

  // Check to see if params where passed
  if (_.isNil(params)) throw new Error('Missing parameter');

  // Find the remote url for the gutenberg data
  params.remoteGutenbergUrl = params.remoteGutenbergUrl || process.env.GUTENBERG_SOURCE || null;
  
  // Check to make sure the remote URL is set
  if (_.isNil(params.remoteGutenbergUrl)) throw new Error('Missing GUTENBERG_SOURCE');
  
  // Get the local gutenburg path
  params.localGutenbergPath = params.localGutenbergPath || DEFAULT_LOCAL_GUTENBERG_PATH;

  // Make the request
  const response = await axios.get(params.remoteGutenbergUrl, {
    responseType: 'stream',
  });
  
  // Stream the data to a file
  response.data.pipe( fs.createWriteStream( params.localGutenbergPath ) );
  
  // Return a Promise
  return new Promise((resolve, reject) => {
    // Wait for stream end or error
    response.data.on('end', () => {
      params.gutenbergDataExtract = true;
      resolve(params);
    });
    response.data.on('error', (err) => {
      params.gutenbergDataExtract = false;
      reject(err);
    });
  });
};

gutenbergData.extract = async (params) => {
  // Only require if extract is called
  const inly = require('inly');
  
  logger.info('We are running an extraction, sit back and wait, this will take a while...');
  
  // Get the local gutenburg path
  params.localGutenbergPath = params.localGutenbergPath || DEFAULT_LOCAL_GUTENBERG_PATH;

  // Get the local extract path
  params.localExtractPath = params.localExtractPath || DEFAULT_LOCAL_EXTRACT_PATH;
  
  // Extract the download file
  let extract = inly(params.localGutenbergPath, params.localExtractPath);
  
  // Return a Promise
  return new Promise((resolve, reject) => {
    // TODO: Review if this event needs to be handled
    // extract.on('file', (name) => {
    //   logger.info('gutenbergData.extract() file name ' + name + '');
    // });
    extract.on('progress', (percent) => {
      logger.info('Extraction is currently at %s %', percent);
    });
    extract.on('end', () => {
      resolve(params);
    });
    extract.on('error', (err) => {
      reject(err);
    });
  });
};

module.exports = gutenbergData;
