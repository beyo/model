/**
String validation
*/
'use strict';

module.exports = function validateString(value) {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value !== 'string') {
    throw TypeError('Invalid string : ' + JSON.stringify(value));
  }

  return value;
}