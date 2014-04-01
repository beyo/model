/**
Beyo model exceptions
*/

var errorFactory = require('error-factory');

/**
Expose Model: ModelException
*/
module.exports.ModelException = errorFactory('ModelException');

/**
Expose Collection: CollectionException
*/
module.exports.CollectionException = errorFactory('CollectionException');

/**
Expose Types: TypeException
*/
module.exports.TypeException = errorFactory('TypeException');

/**
Expose Types: ValidationException
*/
module.exports.ValidationException = errorFactory('ValidationException');
