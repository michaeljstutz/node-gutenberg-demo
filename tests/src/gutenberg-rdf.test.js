'use strict';

require('dotenv').config();

const GutenbergRDF = require('../../src/gutenberg-rdf');
const SAMPLE_RDF_FILE_0 = __dirname + '/../data/gutenberg/cache/epub/0/pg0.rdf';
const SAMPLE_RDF_FILE_1 = __dirname + '/../data/gutenberg/cache/epub/1/pg1.rdf';

describe('Test GutenbergRDF class', () =>{
  it('should be able to parse and load rdf file pg0.rdf', () => {
    let testRDF = new GutenbergRDF(SAMPLE_RDF_FILE_0);
    return testRDF.load().then(()=>{
      expect(testRDF.id).toEqual(0);
      expect(testRDF.title).toEqual(null);
      expect(testRDF.authors).toEqual([]);
      expect(testRDF.publisher).toEqual('Project Gutenberg');
      expect(testRDF.publicationDate).toEqual(null);
      expect(testRDF.subjects).toEqual([]);
      expect(testRDF.languages).toEqual([]);
      expect(testRDF.licenseRights).toEqual('http://www.gnu.org/licenses/gpl.html');
    });
  });
  it('should be able to parse and load rdf file pg1.rdf', () => {
    let testRDF = new GutenbergRDF(SAMPLE_RDF_FILE_1);
    return testRDF.load().then(()=>{
      expect(testRDF.id).toEqual(1);
      expect(testRDF.title).toEqual('The Declaration of Independence of the United States of America');
      expect(testRDF.authors).toEqual(['Jefferson, Thomas']);
      expect(testRDF.publisher).toEqual('Project Gutenberg');
      expect(testRDF.publicationDate).toEqual('1971-12-01');
      expect(testRDF.subjects).toEqual(['United States. Declaration of Independence','United States -- History -- Revolution, 1775-1783 -- Sources']);
      expect(testRDF.languages).toEqual(['en']);
      expect(testRDF.licenseRights).toEqual('https://creativecommons.org/publicdomain/zero/1.0/');
    });
  });
});