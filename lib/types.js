/**
Types
*/
'use strict';

const TYPE_TEST_REGEX = new RegExp('^(.*?)\\s*(\\[\\])?$');
const VALIDATE_MAX_ARR_INDEX = 1000;

const stringify = require("stringify-object");
const isNameValid = require('var-validator').isValid;

const TypeError = require('error-factory')('beyo.model.TypeError');

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
    type = type.name.replace(/_/g, '.');
  } else if (typeof type !== 'string') {
    throw new TypeError('Type name must be a string : ' + (type && type.toString && type.toString() || '{}'));
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
  if (typeof name === 'function') {
    validator = type;
    type = name;
    name = type.name;
  }

  if (typeof name !== 'string') {
    throw new TypeError('Invalid type name : ' + (name && name.toString && name.toString() || '{}'));
  } else if (typeof type !== 'function') {
    throw new TypeError('Invalid type : ' + (type && type.toString && type.toString() || '{}'));
  } else if (validator === undefined) {
    validator = defaultValidator(type);
  } else if (typeof validator !== 'function') {
    throw new TypeError('Invalid or missing validator for type : ' + name);
  }

  const typeDef = parseType(name);

  if (primitives[typeDef.name]) {
    throw new TypeError('Cannot override primitive type : ' + type);
  } else if (registry[typeDef.name] && (registry[typeDef.name].validator !== validator)) {
    throw new TypeError('Cannot override defined type : ' + type);
  } else if (typeDef.isArray) {
    throw new TypeError('Cannot define array type : ' + type);
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

  if (typeDef.isArray) {
    throw new TypeError('Cannot undefine array type : ' + type);
  } else if (primitives[typeDef.name]) {
    throw new TypeError('Cannot undefine primitive type : ' + type);
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
  } else if (value === undefined || value === null) {
    return value;
  } else if (typeDef.isArray) {
    if (!Array.isArray(value)) {
      throw new TypeError('Value is not an array for type : ' + type);
    }

    for (let i = 0, iLen = value.length; i < iLen; ++i) {
      if (value[i] !== undefined && value[i] !== null) {
        value[i] = validator(value[i]);
      }
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
Validate the type name. This method ignores if the type is an array to and will
only return true if the name is valid.

@param type {string}        the type to validate
@return {boolean}
*/
function isValidType(type) {
  try {
    return parseType(type), true;
  } catch (e) {
    return false;
  }
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

    throw new TypeError('Invalid ' + Type.name + ' : ' + stringify(value));
  };
}
