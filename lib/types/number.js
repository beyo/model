/**
Number validation
*/
'use strict';

const TypeError = require('error-factory')('beyo.model.TypeError');


module.exports = function validateNumber(value) {
  if (typeof value === 'string') {
    value = parseFloat(value, 10);
  }
  if (value === undefined || value === null) {
    return value;
  }

  if ((typeof value !== 'number') || isNaN(value)) {
    throw new TypeError('Invalid number : ' + (value.toString && value.toString() || '{}'));
  }

  return value;
}