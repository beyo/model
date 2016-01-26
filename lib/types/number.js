/**
Number validation
*/
'use strict';

const stringify = require("stringify-object");
const TypeError = require('error-factory')('beyo.model.TypeError');


module.exports = function validateNumber(value) {
  if (typeof value === 'string') {
    value = parseFloat(value, 10);
  }

  if ((typeof value !== 'number') || isNaN(value)) {
    throw new TypeError('Invalid number : ' + stringify(value));
  }

  return value;
}