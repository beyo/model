/**
Number validation
*/
'use strict';

module.exports = function validateNumber(value) {
  if (value === undefined || value === null) {
    return value;
  } else if (typeof value === 'string') {
    value = parseFloat(value);
  }

  if ((typeof value !== 'number') || isNaN(value)) {
    throw TypeError('Invalid number : ' + JSON.stringify(value));
  }

  return value;
}