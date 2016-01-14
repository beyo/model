/**
Types
*/
'use strict';

const TYPE_TEST_REGEX = new RegExp('(.*?)\\s*(\\[\\])?$');
const VALIDATE_MAX_ARR_INDEX = 1000;

const errorFactory = require('error-factory');
const isNameValid = require('var-validator').isValid;

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


/**
Expose API
*/
module.exports.define = defineType;
module.exports.undefine = undefineType;
module.exports.getDefinedNames = getDefinedNames;
module.exports.isDefined = isDefined;
module.exports.validate = validate;
module.exports.isValidType = isValidType;
module.exports.parseType = parseType;

Object.freeze(module.exports);


/**
Parse the given type. The value must be a valid type. The returned
value is an object containing two properties : 

 1. name : the name of the type
 2. isArray : true if the given type is described as being an array

@param type {string}
@return {object}
*/
function parseType(type) {
  let typeName;
  let arrOffset;
  let typeArray = '';
  let arrayIndexes = undefined;

  if (type instanceof Function) {
    type = type.name;
  } else if (typeof type !== 'string') {
    throw new TypeError('Type name must be a string : ' + JSON.stringify(type));
  }

  let typeMatch = type.trim().match(TYPE_TEST_REGEX);

  if (!typeMatch || !isNameValid(typeMatch[1], varValidatorOptions)) {
    throw new TypeError('Invalid type : ' + type);
  }

  return {
    name: typeMatch[1].toLocaleLowerCase(),
    isArray: !!typeMatch[2]
  };
}



/**
Define a new type.

@param name {string} (optional)    the type's name
@param type {Function}             the type's constructor function to define
@param {Function} validator        the validator function (ignored if type is a Function
*/
function defineType(name, type, validator) {
  if (typeof name !== 'string') {
    validator = type;
    type = name;
    name = type.name;
  }

  if (type instanceof Function) {
    validator = defaultValidator(type);
    type = type.name;
  } else if (!(validator instanceof Function)) {
    throw new TypeError('Validator must be a function for string : ' + JSON.stringify(type));
  }

  const typeDef = parseType(type);

  if (primitives[typeDef.name]) {
    throw new TypeError('Cannot override primitive type : ' + type);
  } else if (registry[typeDef.name] && (registry[typeDef.name].validator !== validator)) {
    throw new TypeError('Cannot override defined type : ' + type);
  }

  return registry[typeDef.name] = validator;
}

/**
Undefine a type.

@param type {string}
@return {Function|false}
*/
function undefineType(type) {
  const typeDef = parseType(type);

  if (primitives[typeDef.name]) {
    throw new TypeError('Cannot undefine primitive type : ' + typeDef.name);
  }

  let removed = registry[typeDef.name];

  delete registry[typeDef.name];

  return removed || false;
}

/**
Validate the specified value against type

@param type {string}
@param value {mixed}
@param {mixed}
*/
function validate(type, value) {
  const typeDef = parseType(type);
  const validator = primitives[typeDef.name] || registry[typeDef.name];

  if (!validator) {
    throw new TypeError('Unknown type : ' + JSON.stringify(type));
  } else if (typeDef.indexes) {
    if (!Array.isArray(value)) {
      throw new TypeError('Value is not an array for type : ' + type);
    }

    for (let i = 0, iLen = value.length; i < iLen; ++i) {
      value[i] = validator(value[i]);
    }

    return value;
  } else {
    return validator(value);
  }
}

/**
Return all defined type names
*/
function getDefinedNames() {
  return Object.keys(primitives).concat(Object.keys(registry));
}


function isDefined(type) {
  const typeDef = parseType(type);

  return !!(registry[typeDef.name] || primitives[typeDef.name]);
}


/**
Returns an object if typeDef can be parsed correctly.
*/
function isValidType(type) {
  return parseType(type);
};



/**
Simple default validator. Only check if value is an instance of Type and return it.
The validator will ignore null and undefined values, as all other primitive validators.

@param Type {Function}
@return {Function}
*/
function defaultValidator(Type) {
  /**
  Return the value if it is null, undefined, or an instance of Type.

  @param value {mixed}
  @return {mixed}
  */
  return function validator(value) {
    if (value === undefined || value === null || value instanceof Type) {
      return value;
    }

    throw new TypeError('Invalid ' + value.name + ' : ' + JSON.stringify(value));
  };
}
