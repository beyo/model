/**
Boolean validation
*/
'use strict';

const TypeError = require('error-factory')('beyo.model.TypeError');


module.exports = function validateBoolean(value) {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value === 'number') {
    value = Boolean(value);
  } else if (typeof value === 'string') {
    const stringValue = value.toLocaleLowerCase();

    if (stringValue === 'true' || stringValue === '1') {
      value = true;
    } else if (stringValue === 'false' || stringValue === '0') {
      value = false;
    }
  }

  if (typeof value !== 'boolean') {
    throw new TypeError('Invalid boolean : ' + (value.toString && value.toString() || '{}'));
  }

  return value;
}