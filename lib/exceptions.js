/**
Beyo model exceptions
*/

var errorFactory = require('error-factory');

var namedArguments = [
  'message',          // the error message (string)
  'status',           // the error code status (may be HTTP status code)
  'fields',           // the fields applicable by this error (array)
  'templateData',     // the data, in case 'message' is a template
  'expose'            // true to expose this error even in production mode
];


/**
Expose Model: ModelException
*/
module.exports.ModelException = errorFactory('ModelException', namedArguments);

/**
Expose Collection: CollectionException
*/
module.exports.CollectionException = errorFactory('CollectionException', namedArguments);

/**
Expose Types: TypeException
*/
module.exports.TypeException = errorFactory('TypeException', namedArguments);

/**
Expose Types: ValidationException
*/
module.exports.ValidationException = errorFactory('ValidationException', namedArguments);
