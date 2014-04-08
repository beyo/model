/**
Types
*/

var util = require('util');
var isNameValid = require('./name-validator');

var registry;
var primitives;

var TypeException = require('./exceptions').TypeException;
var ValidationException = require('./exceptions').ValidationException;

/**
  ============ Registry ============
*/
primitives = {
  'int': _integer,
  'integer': _integer,
  'float': _number,
  'number': _number,
  'uuid': _notImplemented,
  'text': _string,
  'string': _string,
  'bool': _boolean,
  'boolean': _boolean,
  'time': _notImplemented,
  'date': _notImplemented,
  'datetime': _notImplemented,
  'timestamp': _notImplemented,
  'array': _array,
  'object': _object
};
registry = {};


module.exports.define = defineType;
module.exports.undefine = undefineType;
module.exports.check = checkType;
module.exports.getDefinedNames = getDefinedNames;
module.exports.isDefined = isDefined;

Object.freeze(module.exports);


/**
Define a new type.

@param {String|Funciton} type      the type's name or constructor function to define
@param {Function} validator        the validator function (ignored if type is a Function
*/
function defineType(type, validator) {
  if (type instanceof Function) {
    validator = _customValidator(type);
    type = type.name;

    //console.log("Custom type", typeof type, type, validator);
  } else if (!(validator instanceof Function)) {
    throw TypeException('Validator must be a function for `{{type}}`', null, null, { type: type });
  }

  if (typeof type !== 'string') {
    throw TypeException('Type name must be a string `{{type}}`', null, null, { type: String(type) });
  } else if (!type.replace(/\s/g, '').length) {
    throw TypeException('Type name must not be empty');
  } else if (!isNameValid(type)) {
    throw TypeException('Invalid type name `{{type}}`', null, null, { type: type });
  }

  if (primitives[type.toLocaleLowerCase()]) {
    throw TypeException('Cannot override primitive type `{{type}}`', null, null, { type: type });
  }

  return registry[type] = validator;
}

/**
Undefine a type.
*/
function undefineType(type) {
  var validator;

  if (type instanceof Function) {
    type = type.name;
  }

  if (typeof type !== 'string') {
    throw TypeException('Type name must be a string `{{type}}`', null, null, { type: String(type) });
  } else if (primitives[type.toLocaleLowerCase()]) {
    throw TypeException('Cannot undefine primitive type `{{type}}`', null, null, { type: type });
  }

  validator = registry[type];

  delete registry[type];

  return validator;
}

/**
Check value against type
*/
function checkType(type, value, previous, attributeName) {
  if (type instanceof Function) {
    type = type.name;
  }

  if (typeof type !== 'string') {
    throw TypeException('Type name must be a string `{{type}}`', null, null, { type: String(type) });
  }

  validator = primitives[type.toLocaleLowerCase()] || registry[type];

  if (!validator) {
    throw TypeException('Unknown type `{{type}}`', null, null, { type: type });
  }

  return validator(value, previous);
}

/**
Return all defined type names
*/
function getDefinedNames() {
  return Object.keys(primitives).concat(Object.keys(registry));
}


function isDefined(type) {
  if (type instanceof Function) {
    type = type.name;
  } else if (typeof type !== 'string') {
    throw TypeException('Type name must be a string `{{type}}`', null, null, { type: String(type) });
  }

  return !!(registry[type] || primitives[type.toLocaleLowerCase()]);
}


/**
  ============= Validators =============
**/


// primitive types

function _notImplemented() {
  throw 'Ooops! Not implemented! Sorry.';
}

function _integer(v) {
  var value;

  if (v === undefined || v === null) {
    return v;
  } else if (typeof v === 'string') {
    v = parseFloat(v);
  }

  value = Math.round(v);

  if ((typeof v !== 'number') || !isFinite(value) || isNaN(value) || (value !== v)) {
    throw ValidationException('Invalid integer `{{value}}`', null, null, { value: v });
  }

  return value;
}

function _number(v) {
  if (v === undefined || v === null) {
    return v;
  } else if (typeof v === 'string') {
    v = parseFloat(v);
  }

  if ((typeof v !== 'number') || isNaN(v)) {
    throw ValidationException('Invalid number `{{value}}`', null, null, { value: v });
  }

  return v;
}

function _string(v) {
  if (v === undefined || v === null) {
    return v;
  }

  if (typeof v === 'number') {
    v = String(v);
  } else if (typeof v !== 'string') {
    throw ValidationException('Invalid string `{{value}}`', null, null, { value: v });
  }

  return v;
}

function _boolean(v) {
  if (v === undefined || v === null) {
    return v;
  }

  if (typeof v === 'number') {
    v = Boolean(v);
  } else if (typeof v !== 'boolean') {
    throw ValidationException('Invalid boolean `{{value}}`', null, null, { value: v });
  }

  return v;
}

function _array(v) {
  if (v === undefined || v === null) {
    return v;
  }

  if (!(v instanceof Array)) {
    throw ValidationException('Invalid array `{{value}}`', null, null, { value: v });
  }

  return v;
}

function _object(v) {
  if (v === undefined || v === null) {
    return v;
  }

  if (Object.prototype.toString.call(v) !== '[object Object]') {
    throw ValidationException('Invalid object `{{value}}`', null, null, { value: v });
  }

  return v;
}

function _customValidator(CustomType) {
  return function customValidator(v) {
    if (v === undefined || v === null || v instanceof CustomType) {
      return v;
    }

    throw ValidationException('Invalid ' + CustomType.name + ' `{{value}}`', null, null, { value: v });
  };
}
