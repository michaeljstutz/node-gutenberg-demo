'use strict';

require('dotenv').config();

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const _ = require('lodash');
const Promise = require('bluebird');
const fs = require('fs');

const gutenbergData = require('../../src/gutenberg-data');

const SAMPLE_DOWNLOAD_FILE_PASS = __dirname + '/../data/test_data.tar.bz2';
const SAMPLE_DOWNLOAD_FILE_MISSING = __dirname + '/../data/data.tar.bz2';
const SAMPLE_EXPORT_PATH_PASS = __dirname + '/../data/gutenberg';
const SAMPLE_EXPORT_PATH_MISSING = __dirname + '/../data/gutenbergMissing';

describe('Test check() method', () =>{
  it('should throw error if parameter not passed', () => {
    return expect(gutenbergData.check()).rejects.toThrow('Missing parameter');
  });
  it('should pass check everything is good', () => {
    let params = {
      localGutenbergPath: SAMPLE_DOWNLOAD_FILE_PASS,
      localExtractPath: SAMPLE_EXPORT_PATH_PASS,
    };
  
    fs.utimesSync(SAMPLE_DOWNLOAD_FILE_PASS, new Date(), new Date());
    
    return gutenbergData.check(params).then(()=>{
      expect(params.gutenbergDataDownload).toEqual(false);
      expect(params.gutenbergDataExtract).toEqual(false);
      return Promise.resolve();
    });
  });
  it('should pass check and need to not download but need to extract', () => {
    let params = {
      localGutenbergPath: SAMPLE_DOWNLOAD_FILE_PASS,
      localExtractPath: SAMPLE_EXPORT_PATH_MISSING,
    };
  
    fs.utimesSync(SAMPLE_DOWNLOAD_FILE_PASS, new Date(), new Date());
    
    return gutenbergData.check(params).then(()=>{
      expect(params.gutenbergDataDownload).toEqual(false);
      expect(params.gutenbergDataExtract).toEqual(true);
      return Promise.resolve();
    });
  });
  it('should pass check and need to download based on cache time and not extract', () => {
    let params = {
      localGutenbergPath: SAMPLE_DOWNLOAD_FILE_PASS,
      localExtractPath: SAMPLE_EXPORT_PATH_PASS,
    };
  
    fs.utimesSync(SAMPLE_DOWNLOAD_FILE_PASS, new Date(2000).getTime(), new Date(2000).getTime());
    
    return gutenbergData.check(params).then(()=>{
      expect(params.gutenbergDataDownload).toEqual(true);
      expect(params.gutenbergDataExtract).toEqual(false);
      return Promise.resolve();
    });
    
  });
  it('should pass check and need to download and not extract', () => {
    let params = {
      localGutenbergPath: SAMPLE_DOWNLOAD_FILE_MISSING,
      localExtractPath: SAMPLE_EXPORT_PATH_PASS,
    };
  
    fs.utimesSync(SAMPLE_DOWNLOAD_FILE_PASS, new Date(), new Date());
    
    return gutenbergData.check(params).then(()=>{
      expect(params.gutenbergDataDownload).toEqual(true);
      expect(params.gutenbergDataExtract).toEqual(false);
      return Promise.resolve();
    });
  });
});

// describe('Test download() method', () =>{
//   it('should throw error if parameter not passed', () => {
//     return expect(gutenbergData.download()).rejects.toThrow('Missing parameter');
//   });
//   // it('should download a file', () => {
//   //   let mockAdapter = new MockAdapter(axios);
//   //   // mockAdapter.onGet('https://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.bz2').reply(404, {
//   //   //   data: 'EXAMPLE DATA'
//   //   // });
//   //
//   //   return expect(gutenbergData.download({})).resolve.not.toThrow();
//   //
//   // });
// });

afterAll(() => {
  fs.utimesSync(SAMPLE_DOWNLOAD_FILE_PASS, new Date(), new Date());
  
  return new Promise((resolve, reject)=>{
    fs.unlink(SAMPLE_DOWNLOAD_FILE_MISSING, ()=>resolve());
  });
});
