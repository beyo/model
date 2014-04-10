/**
Beyo model exceptions
*/

var errorFactory = require('error-factory');

var namedArguments = {
  'message': undefined,          // the error message (string)
  'status': undefined,           // the error code status (may be HTTP status code)
  'fields': undefined,           // the fields applicable by this error (array)
  'messageData': undefined,     // the data, in case 'message' is a template
  'expose': true                 // true to expose this error even in production mode
};


/**
Expose Model: ModelException
*/
module.exports.ModelException = errorFactory('beyo.model.ModelException', namedArguments);

/**
Expose Collection: CollectionException
*/
module.exports.CollectionException = errorFactory('beyo.model.CollectionException', namedArguments);

/**
Expose Types: TypeException
*/
module.exports.TypeException = errorFactory('beyo.model.TypeException', namedArguments);

/**
Expose Types: ValidationException
*/
module.exports.ValidationException = errorFactory('beyo.model.ValidationException', namedArguments);
