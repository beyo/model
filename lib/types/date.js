/**
Date validation
*/
'use strict';

module.exports = function validateDate(value) {
  if (value === undefined || value === null) {
    return v;
  } else if (typeof value === 'string' || typeof value === 'numeric') {
    if (typeof value === 'string' && !isNaN(value)) {
      value = new Date(parseInt(value));
    } else {
      value = new Date(value);
    }
  }

  if (!(value instanceof Date) || isNaN(value.getTime())) {
    throw TypeError('Invalid date : ' + JSON.stringify(value));
  }

  return value;
}