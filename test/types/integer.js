/**
Integer validation
*/
'use strict';

module.exports = function validateInteger(value) {
  if (value === undefined || value === null) {
    return value;
  } else if (typeof value === 'string') {
    value = parseFloat(value);
  }

  let intValue = Math.round(value);

  if ((typeof value !== 'number') || !isFinite(intValue) || isNaN(intValue) || (value !== intValue)) {
    throw new TypeError('Invalid integer : ' + JSON.stringify(value));
  }

  return intValue;
}