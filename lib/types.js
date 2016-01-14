/**
Types
*/

const VALIDATE_MAX_ARR_INDEX = 1000;

const errorFactory = require('error-factory');

const isNameValid = require('var-validator').isValid;
const isArrayValid = require('./array-validator');

const TypeError = errorFactory('beyo.TypeError');

const varValidatorOptions = {
  enableScope: true,
  enableBrackets: false,
  allowLowerCase: true,
  allowUpperCase: true
};


/**
  ============ Registry ============
*/
const primitives = {
  'int': require('./types/integer'),
  'integer': require('./types/integer'),
  'float': require('./types/number'),
  'number': require('./types/number'),
  'text': require('./types/string'),
  'string': require('./types/string'),
  'bool': require('./types/boolean'),
  'boolean': require('./types/boolean'),
  'date': require('./types/date'),
  'array': require('./types/array'),
  'object': require('./types/object')
};
const registry = {};


module.exports.define = defineType;
module.exports.undefine = undefineType;
module.exports.check = checkType;
module.exports.getDefinedNames = getDefinedNames;
module.exports.isDefined = isDefined;
module.exports.isValidType = isValidType;
module.exports.parseTypeDef = parseTypeDef;

Object.freeze(module.exports);


function parseTypeDef(type) {
  var typeName;
  var arrOffset;
  var typeArray = '';
  var arrayIndexes = undefined;

  if (type instanceof Function) {
    type = type.name;
  } else if (typeof type !== 'string') {
    throw TypeException('Type name must be a string `{{type}}`', null, null, { type: String(type) });
  }

  if (type && ((arrOffset = type.indexOf('[')) >= 0)) {
    typeName = type.substring(0, arrOffset);
    typeArray = type.substring(arrOffset);
  } else {
    typeName = type;
  }

  if (!typeName.replace(/\s/g, '').length) {
    throw TypeException('Type name must not be empty');
  } else if (!isNameValid(typeName, varValidatorOptions)) {
    throw TypeException('Invalid type name `{{type}}`', null, null, { type: type });
  } else if (!isArrayValid(typeArray)) {
    throw TypeException('Invalid array type `{{type}}`', null, null, { type: type });
  }

  if (typeArray) {
    arrayIndexes = typeArray.split('[').slice(1).map(function (item) {
      item = item.trim();
      if (item === ']') {
        return Infinity;
      } else {
        return parseInt(item.substring(0, item.length - 1), 10);
      }
    });
  }

  return {
    name: typeName,
    indexes: arrayIndexes
  };
}



/**
Define a new type.

@param {String|Funciton} type      the type's name or constructor function to define
@param {Function} validator        the validator function (ignored if type is a Function
*/
function defineType(type, validator) {
  var typeDef;
  var regKey;

  if (type instanceof Function) {
    validator = _customValidator(type);
    type = type.name;

    //console.log("Custom type", typeof type, type, validator);
  } else if (!(validator instanceof Function)) {
    throw TypeException('Validator must be a function for `{{type}}`', null, null, { type: type });
  }

  typeDef = parseTypeDef(type);
  regKey = typeDef.name.toLocaleLowerCase();

  if (primitives[regKey]) {
    throw TypeException('Cannot override primitive type `{{type}}`', null, null, { type: typeDef.name });
  } else if (registry[regKey] && (registry[regKey].validator !== validator)) {
    throw TypeException('Validator conflict for type `{{type}}` ', null, null, { type: typeDef.name });
  }

  registry[regKey] = {
    type: typeDef.name,
    validator: validator
  };

  return validator;
}

/**
Undefine a type.
*/
function undefineType(type) {
  var validator;
  var typeDef = parseTypeDef(type);
  var regKey = typeDef.name.toLocaleLowerCase();

  if (primitives[regKey]) {
    throw TypeException('Cannot undefine primitive type `{{type}}`', null, null, { type: typeDef.name });
  }

  validator = registry[regKey] && registry[regKey].validator;

  delete registry[regKey];

  return validator || false;
}

/**
Check value against type
*/
function checkType(type, value, previous, attributeName) {
  var typeDef = parseTypeDef(type);
  var regKey = typeDef.name.toLocaleLowerCase();

  validator = primitives[regKey] || (registry[regKey] && registry[regKey].validator);

  if (!validator) {
    throw TypeException('Unknown type `{{type}}`', null, [ attributeName ], { type: typeDef.name });
  } else if (typeDef.indexes) {
    return arrayValidation(typeDef, 0, value, previous, attributeName, validator);
  }

  return validator(value, previous, attributeName);
}

/**
Return all defined type names
*/
function getDefinedNames() {
  return Object.keys(primitives).concat(Object.keys(registry).map(function (type) {
    return registry[type].type;
  }));
}


function isDefined(type) {
  var typeDef = parseTypeDef(type);
  var regKey = typeDef.name.toLocaleLowerCase();

  return !!(registry[regKey] || primitives[regKey]);
}


/**
Returns an object if typeDef can be parsed correctly.
*/
function isValidType(type) {
  return parseTypeDef(type);
};


/**
  ============= Validators =============
**/

function arrayValidation(typeDef, index, value, previous, attributeName, validator) {
  var indexInc;
  var i;
  var ilen;

  if (value === null || value === undefined || typeDef.indexes.length <= index) {
    //console.log("Validating", value, index, typeDef);
    return validator(value, previous, attributeName);
  } else if (typeDef.indexes.length > index) {
    //console.log("Checking array", value, index, typeDef);
    if (value instanceof Array) {
      if (value.length) {
        indexInc = Math.max(Math.floor(value.length / VALIDATE_MAX_ARR_INDEX), 1);

        for (i = 0, ilen = value.length; i < ilen; i += indexInc) {
          arrayValidation(typeDef, index + 1, value[i], previous instanceof Array ? previous[i] : undefined, attributeName, validator);
        }

        return value;
      } else if (previous instanceof Array && previous.length) {
        indexInc = Math.max(Math.floor(value.length / VALIDATE_MAX_ARR_INDEX), 1);

        for (i = 0, ilen = value.length; i < ilen; i += indexInc) {
          arrayValidation(typeDef, index + 1, null, previous[i], attributeName, validator)
        }

        return value;
      } else {
        return arrayValidation(typeDef, index + 1, undefined, undefined, attributeName, validator)
      }
    }
  }

  throw TypeException('Invalid array for `{{type}}`', null, [ attributeName ], { type: typeDef.name, indexes: typeDef.indexes });
}


function _customValidator(CustomType) {
  return function customValidator(v, p, name) {
    if (v === undefined || v === null || v instanceof CustomType) {
      return v;
    }

    throw ValidationException('Invalid ' + CustomType.name + ' `{{value}}`', null, [ name ], { value: JSON.stringify(v) });
  };
}
