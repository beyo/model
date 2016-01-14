/**
Boolean validation
*/
'use strict';

module.exports = function validateBoolean(value) {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value === 'number') {
    value = Boolean(value);
  } else if (typeof value === 'string') {
    const stringValue = value.toLocaleLowerCase();

    if (stringValue === 'true') {
      value = true;
    } else if (stringValue === 'false') {
      value = false;
    }
  }

  if (typeof value !== 'boolean') {
    throw TypeError('Invalid boolean : ' + JSON.stringify(value));
  }

  return value;
}