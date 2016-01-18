/**
Object validation
*/
'use strict';

module.exports = function validateArray(value) {
  if (value === undefined || value === null) {
    return value;
  }

  if (Object.prototype.toString.call(value) !== '[object Object]') {
    throw TypeError('Invalid object : ' + JSON.stringify(value));
  }

  return value;
}