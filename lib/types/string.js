/**
String validation
*/
'use strict';

const TypeError = require('error-factory')('beyo.model.TypeError');


module.exports = function validateString(value) {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value !== 'string') {
    throw new TypeError('Invalid string : ' + (value.toString && value.toString() || '{}'));
  }

  return value;
}