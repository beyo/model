/**
Array validation
*/
'use strict';

const TypeError = require('error-factory')('beyo.model.TypeError');


module.exports = function validateArray(value) {
  if (value === undefined || value === null || Array.isArray(value)) {
    return value;
  }

  throw new TypeError('Invalid array : ' + (value.toString && value.toString() || '{}'));
}