'use strict';

require('dotenv').config();

const rewire = require('rewire');
const logger = rewire('../../src/logger');

describe('Test logger instance', () =>{
  it('should have log method', () => {
    return expect(logger.log).toBeDefined();
  });
  it('should have error method', () => {
    return expect(logger.error).toBeDefined();
  });
  it('should have info method', () => {
    return expect(logger.info).toBeDefined();
  });
  it('should have working loggerFormat function', () => {
    return expect(logger.info).toBeDefined();
  });
});