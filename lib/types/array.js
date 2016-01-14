/**
Array validation
*/
'use strict';

module.exports = function validateArray(value) {
  if (value === undefined || value === null) {
    return value;
  }

  if (!Array.isArray(value)) {
    throw ValidationException('Invalid array : ' + JSON.stringify(value));
  }

  return value;
}