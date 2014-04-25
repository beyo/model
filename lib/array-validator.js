/**
Array validator
*/

const TYPE_ARRAY_REGEX = new RegExp('^(\\s*\\[(\\d*)\\])*$');


/**
Expose function as module
*/
module.exports = validateArray;

/**
Validate the given value and make sure it is valid array indexes. The value must
be a valid String

@param {String} indexes   the value to validate
@return {Boolean}         true if the val is valid, false otherwise
*/
function validateArray(indexes) {
  var valid = false;

  if (typeof indexes === 'string') {
    if (indexes.match(TYPE_ARRAY_REGEX)) {
      valid = true;
    }
  }

  return valid;
}
