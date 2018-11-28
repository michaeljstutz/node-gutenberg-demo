'use strict';

require('dotenv').config();

const _ = require('lodash');
const Promise = require('bluebird');
const PQueue = require('p-queue');

const DEFAULT_IMPORT_GUTENBERG_GLOB = __dirname + '/../data/gutenberg/cache/epub/**/*.rdf';
const DEFAULT_QUEUE_CONCURRENCY = parseInt(process.env.QUEUE_CONCURRENCY) || 10;
const STATUS_ON_INCREMENTS = 1000;

const logger = require('./logger');
const GutenbergRDF = require('./gutenberg-rdf');
const db = require(__dirname + '/../db/');
const fg = require('fast-glob');
const queue = new PQueue({concurrency: DEFAULT_QUEUE_CONCURRENCY});
const importData = {};

let processRDFCounter = 0;
let lastError = null;

importData.errorInQueue = async (err) => {
  lastError = err;
  queue.pause();
  queue.clear();
  logger.info('Error... paused and cleared queue');
  return Promise.reject(err);
};

importData.processGutenbergData = async (params) => {
  let globCounter = 0;
  
  // Get the import gutenberg glob
  params.importGutenbergGlob = params.importGutenbergGlob || DEFAULT_IMPORT_GUTENBERG_GLOB;
  
  // Get the file paths that need to be processed
  let globStream = fg.stream([params.importGutenbergGlob]);
  
  // Return a Promise
  return new Promise((resolve, reject)=>{
    globStream.on('data', (filePath)=>{
      // Because we are using a queue we want to make sure there are no outstanding errors that should stop things
      if (lastError) {
        globStream.pause();
        reject(lastError);
      }
      
      // Add the filePath to the queue to be processed
      queue.add(importData.processFileRDF.bind(null, params, filePath));
      
      // Increment counter then log status when needed
      globCounter++;
      if ( globCounter % STATUS_ON_INCREMENTS === 0 ) logger.info('Found %s files, current queue status is %s pending with a queue size of %s ', globCounter, queue.pending, queue.size);
    });
    globStream.once('end', ()=>{
      logger.info('Found a total of %s files, current queue status is %s pending with a queue size of %s ', globCounter, queue.pending, queue.size);
      
      // Now that the glob has finish, wait for the queue to be idle before moving on
      queue.onIdle().then(()=>{
        logger.info('Queue has reached a state of idle, completing %s files', globCounter);
        resolve(params);
      });
    });
    globStream.once('error', (err)=>{
      reject(err);
    });
  });
};

importData.queueProgressReport = async () => {
  processRDFCounter++;
  if ( processRDFCounter % STATUS_ON_INCREMENTS === 0 ) logger.info('Processed %s RDF files, current queue status is %s pending with a queue size of %s ', processRDFCounter, queue.pending, queue.size);
};

importData.processFileRDF = async (params, filePath) => {
  // Load up the RDF data
  let grdf = new GutenbergRDF(filePath);
  await grdf.load().then(()=>{
    
    // If the id is NaN we should skip processing the file
    if (_.isNaN(grdf.id)) return Promise.resolve(importData.queueProgressReport);
    
    // Populate needed values
    let bookValues = {
      title: grdf.title,
      authors: grdf.authors,
      publisher: grdf.publisher,
      publicationDate: grdf.publicationDate,
      subjects: grdf.subjects,
      languages: grdf.languages,
      licenseRights: grdf.licenseRights,
    };
    
    // Basic Update or Insert logic
    return db.Book.findByPk(grdf.id).then(book=>{
      
      // Check to see if the book is in the db and if so update
      if (book) return book.update(bookValues).then(importData.queueProgressReport);
      
      // Book was not found so add the id in and update
      bookValues.id = grdf.id;
      return db.Book.build(bookValues).save().then(importData.queueProgressReport);
      
    }).catch(err => {
      logger.error(err);
      logger.info('Error while processing id %s but will keep going, press ctl + c if you see more errors like this', grdf.id);
    });
    
  }).catch((err) => {
    return importData.errorInQueue(err);
  });
  
};

module.exports = importData;