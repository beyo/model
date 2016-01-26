/**
Integer validation
*/
'use strict';

const stringify = require("stringify-object");
const TypeError = require('error-factory')('beyo.model.TypeError');


module.exports = function validateInteger(value) {
  if (typeof value === 'string') {
    value = parseFloat(value, 10);
  }

  if (value === Infinity || value === -Infinity) {
    return value;
  }

  const intValue = value|0;

  if ((typeof value !== 'number') || isNaN(intValue) || (value !== intValue)) {
    throw new TypeError('Invalid integer : ' + stringify(value));
  }

  return intValue;
}