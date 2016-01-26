/**
Date validation
*/
'use strict';

const stringify = require("stringify-object");
const TypeError = require('error-factory')('beyo.model.TypeError');


module.exports = function validateDate(value) {
  let dateValue = value;

  if (typeof dateValue === 'number') {
    dateValue = new Date(dateValue);
  } else if (typeof dateValue === 'string') {
    if (isNaN(dateValue)) {
      dateValue = new Date(dateValue);
    } else {
      dateValue = new Date(parseInt(dateValue));
    }
  }

  if (!(dateValue instanceof Date) || isNaN(dateValue.getTime())) {
    throw new TypeError('Invalid date : ' + stringify(value));
  }

  return dateValue;
}