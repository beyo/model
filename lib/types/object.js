/**
Object validation
*/
'use strict';

const stringify = require("stringify-object");
const TypeError = require('error-factory')('beyo.model.TypeError');


module.exports = function validateArray(value) {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    throw new TypeError('Invalid object : ' + stringify(value));
  }

  return value;
}