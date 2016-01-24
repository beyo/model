/**
Object validation
*/
'use strict';

const TypeError = require('error-factory')('beyo.model.TypeError');


module.exports = function validateArray(value) {
  if (value === undefined || value === null) {
    return value;
  }

  if (Object.prototype.toString.call(value) !== '[object Object]') {
    throw new TypeError('Invalid object : ' + (value.toString && value.toString() || '{}'));
  }

  return value;
}