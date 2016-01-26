/**
String validation
*/
'use strict';

const stringify = require("stringify-object");
const TypeError = require('error-factory')('beyo.model.TypeError');


module.exports = function validateString(value) {
  if (typeof value !== 'string') {
    throw new TypeError('Invalid string : ' + stringify(value));
  }

  return value;
}