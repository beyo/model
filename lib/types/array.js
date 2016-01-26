/**
Array validation
*/
'use strict';

const stringify = require("stringify-object");
const TypeError = require('error-factory')('beyo.model.TypeError');


module.exports = function validateArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  throw new TypeError('Invalid array : ' + stringify(value));
}