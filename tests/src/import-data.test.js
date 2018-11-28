'use strict';

require('dotenv').config();

const SAMPLE_GUTENBERG_GLOB = __dirname + '/../data/gutenberg/cache/epub/**/*.rdf';
const SAMPLE_RDF_FILE_0 = __dirname + '/../data/gutenberg/cache/epub/0/pg0.rdf';
const SAMPLE_RDF_FILE_1 = __dirname + '/../data/gutenberg/cache/epub/1/pg1.rdf';

const importData = require('../../src/import-data');

describe('Test importData.processGutenbergData()', () =>{
  it('should just work', () => {
    let params = {
      importGutenbergGlob: SAMPLE_GUTENBERG_GLOB,
    };
    return importData.processGutenbergData(params).then((newParams)=>{
      return expect(true).toBeTruthy();
    });
  });
});
describe('Test importData.queueProgressReport()', () =>{
  it('placeholder', () => {
    return expect(true).toBeTruthy();
  });
});
describe('Test importData.processFileRDF()', () =>{
  it('should be able to parse and load rdf file pg0.rdf', () => {
    return importData.processFileRDF({}, SAMPLE_RDF_FILE_0).then(()=>{
      return expect(true).toBeTruthy();
    });
  });
  it('should be able to parse and load rdf file pg1.rdf', () => {
    return importData.processFileRDF({}, SAMPLE_RDF_FILE_1).then(()=>{
      return expect(true).toBeTruthy();
    });
  });
});

describe('Test importData.errorInQueue()', () =>{
  it('should reject', () => {
    return expect(importData.errorInQueue('error')).rejects.toMatch('error');
  });
});