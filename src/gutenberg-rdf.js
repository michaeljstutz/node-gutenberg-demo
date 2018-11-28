'use strict';

const _ = require('lodash');
const fs = require('fs');
const $rdf = require('rdflib');
const Promise = require('bluebird');

const QUERY_PREFIX = `
  PREFIX cc: <http://web.resource.org/cc/>
  PREFIX dcam: <http://purl.org/dc/dcam/>
  PREFIX dcterms: <http://purl.org/dc/terms/>
  PREFIX marcrel: <http://id.loc.gov/vocabulary/relators>
  PREFIX pgterms: <http://www.gutenberg.org/2009/pgterms/>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
`;
const QUERY_ID = QUERY_PREFIX + `
  SELECT ?book WHERE {
    ?book a pgterms:ebook .
  }
`;
const QUERY_TITLE = QUERY_PREFIX + `
  SELECT ?title WHERE {
    ?book a pgterms:ebook .
    ?book dcterms:title ?title .
  }
`;
const QUERY_AUTHORS = QUERY_PREFIX + `
  SELECT ?author WHERE {
    ?book a pgterms:ebook .
    ?book dcterms:creator ?a .
    ?a pgterms:name ?author .
  }
  ORDER BY DESC(?author)
`;
const QUERY_PUBLISHER = QUERY_PREFIX + `
  SELECT ?publisher WHERE {
    ?book a pgterms:ebook .
    ?book dcterms:publisher ?publisher .
  }
`;
const QUERY_PUBLICATION_DATE = QUERY_PREFIX + `
  SELECT ?issued WHERE {
    ?book a pgterms:ebook .
    ?book dcterms:issued ?issued .
  }
`;
const QUERY_LANGUAGES = QUERY_PREFIX + `
    SELECT ?lang WHERE {
      ?book a pgterms:ebook .
      ?book dcterms:language ?l .
      ?l rdf:value ?lang .
    }
    ORDER BY DESC(?lang)
`;
const QUERY_SUBJECTS = QUERY_PREFIX + `
  SELECT ?subject WHERE {
    ?book a pgterms:ebook .
    ?book dcterms:subject ?s .
    ?s dcam:memberOf dcterms:LCSH .
    ?s rdf:value ?subject .
  }
  ORDER BY DESC(?subject)
`;
const QUERY_LICENSE = QUERY_PREFIX + `
  SELECT ?license WHERE {
    ?book a cc:Work .
    ?book cc:license ?license .
  }
`;

class GutenbergRDF {
  
  constructor(filePath) {
    this.filePath = filePath;
    this.store = $rdf.graph();
    this.id = '';
    this.title = '';
    this.authors = [];
    this.publisher = '';
    this.publicationDate = '';
    this.subjects = [];
    this.languages = [];
    this.licenseRights = '';
    
    let rdfData = fs.readFileSync(this.filePath).toString();
    $rdf.parse(rdfData, this.store, 'http://www.gutenberg.org/', 'application/rdf+xml');
  }
  
  async load() {
    // Run all the queries to load up all the data
    await this.idQuery();
    await this.titleQuery();
    await this.authorsQuery();
    await this.publisherQuery();
    await this.publicationDateQuery();
    await this.languagesQuery();
    await this.subjectsQuery();
    await this.licenseRightsQuery();
    return true;
  }
  
  async idQuery() {
    // Run SPARQLT query
    let queryReturn = await this.runQuery(QUERY_ID);
    // Assign queried value
    let ebookUri = this.getFirstValueByKey(queryReturn, '?book', null);
    // The id is the last value of the uri (hopefully)
    let pathArray = ebookUri.split('/');
    this.id = parseInt(pathArray.pop());
  }
  
  async titleQuery() {
    // Run SPARQLT query
    let queryReturn = await this.runQuery(QUERY_TITLE);
    // Assign queried value
    this.title = this.getFirstValueByKey(queryReturn, '?title', null);
  }
  
  async authorsQuery() {
    this.authors = [];
    // Run SPARQLT query
    let queryReturn = await this.runQuery(QUERY_AUTHORS);
    // Loop through results
    for (let i = 0, iMax = queryReturn.length; i < iMax; i++) {
      // Assign queried value
      let value = this.getValueByIdKey(queryReturn, i, '?author', 'null');
      if (!_.isNil(value)) this.authors.push(value);
    }
  }
  
  async publisherQuery() {
    // Run SPARQLT query
    let queryReturn = await this.runQuery(QUERY_PUBLISHER);
    // Assign queried value
    this.publisher = this.getFirstValueByKey(queryReturn, '?publisher', null);
  }
  
  async publicationDateQuery() {
    // Run SPARQLT query
    let queryReturn = await this.runQuery(QUERY_PUBLICATION_DATE);
    // Assign queried value
    this.publicationDate = this.getFirstValueByKey(queryReturn, '?issued', null);
    if ('None' == this.publicationDate) this.publicationDate = null;
  }
  
  async languagesQuery() {
    // Create empty array
    this.languages = [];
    // Run SPARQLT query
    let queryReturn = await this.runQuery(QUERY_LANGUAGES);
    // Loop through results
    for (let i = 0, iMax = queryReturn.length; i < iMax; i++) {
      // Assign queried value
      let value = this.getValueByIdKey(queryReturn, i, '?lang', 'null');
      if (!_.isNil(value)) this.languages.push(value);
    }
  }
  
  async subjectsQuery() {
    // Create empty array
    this.subjects = [];
    // Run SPARQLT query
    let queryReturn = await this.runQuery(QUERY_SUBJECTS);
    // Loop through results
    for (let i = 0, iMax = queryReturn.length; i < iMax; i++) {
      // Assign queried value
      let value = this.getValueByIdKey(queryReturn, i, '?subject', 'null');
      if (!_.isNil(value)) this.subjects.push(value);
    }
  }
  
  async licenseRightsQuery() {
    // Run SPARQLT query
    let queryReturn = await this.runQuery(QUERY_LICENSE);
    // Assign queried value
    this.licenseRights = this.getFirstValueByKey(queryReturn, '?license', null);
  }
  
  async runQuery(sparqlQuery) {
    // Keep a reference to this
    let self = this;
    let results = [];
    
    // Parse SPARQLT query to RDF Query
    let query = $rdf.SPARQLToQuery(sparqlQuery, false, self.store);
    
    // Return promise
    return new Promise((resolve) => {
      // Run a RDF Query
      self.store.query(query, (result) => {
        // Append result to results
        results.push(result);
      }, undefined, () => {
        // Resolve Promise with results
        resolve(results);
      });
    });
  }
  
  getFirstValueByKey(object, key, defaultValue = null) {
    return this.getValueByIdKey(object, 0, key, defaultValue);
  }
  
  getValueByIdKey(object, id, key, defaultValue = null) {
    if(_.has(object, [id, key, 'value'])) return object[id][key].value;
    return defaultValue;
  }
}

module.exports = GutenbergRDF;
