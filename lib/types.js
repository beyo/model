/**
Types
*/

var util = require('util');
var isNameValid = require('./name-validator');
var isArrayValid = require('./array-validator');

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
  } else if (!isNameValid(typeName)) {
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
    name: typeName.toLocaleLowerCase(),
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

  if (type instanceof Function) {
    validator = _customValidator(type);
    type = type.name;

    //console.log("Custom type", typeof type, type, validator);
  } else if (!(validator instanceof Function)) {
    throw TypeException('Validator must be a function for `{{type}}`', null, null, { type: type });
  }

  typeDef = parseTypeDef(type);

  if (primitives[typeDef.name]) {
    throw TypeException('Cannot override primitive type `{{type}}`', null, null, { type: typeDef.name });
  } else if (registry[typeDef.name] && (registry[typeDef.name] !== validator)) {
    throw TypeException('Validator conflict for type `{{type}}` ', null, null, { type: typeDef.name });
  }

  registry[typeDef.name] = {
    type: type,
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

  if (primitives[typeDef.name]) {
    throw TypeException('Cannot undefine primitive type `{{type}}`', null, null, { type: type });
  }

  validator = registry[typeDef.name] && registry[typeDef.name].validator;

  delete registry[typeDef.name];

  return validator || false;
}

/**
Check value against type
*/
function checkType(type, value, previous, attributeName) {
  var typeDef = parseTypeDef(type);

  validator = primitives[typeDef.name] || (registry[typeDef.name] && registry[typeDef.name].validator);

  if (!validator) {
    throw TypeException('Unknown type `{{type}}`', null, [ attributeName ], { type: typeDef.name });
  } else if (typeDef.indexes && !arrayValidation(typeDef, 0, value, previous, attributeName, validator)) {
    throw TypeException('Invalid array for `{{type}}`', null, [ attributeName ], { type: typeDef.name, indexes: typeDef.indexes });
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

  return !!(registry[typeDef.name] || primitives[typeDef.name]);
}


/**
  ============= Validators =============
**/

function arrayValidation(typeDef, index, value) {
  if (!(value instanceof Array)) {
    return false;
  } else if (typeDef.indexes.length > index) {
    return arrayValidation(typeDef, index + 1, value);
  } else {

  }
}


// primitive types

function _notImplemented() {
  throw 'Ooops! Not implemented! Sorry.';
}

function _integer(v, p, name) {
  var value;

  if (v === undefined || v === null) {
    return v;
  } else if (typeof v === 'string') {
    v = parseFloat(v);
  }

  value = Math.round(v);

  if ((typeof v !== 'number') || !isFinite(value) || isNaN(value) || (value !== v)) {
    throw ValidationException('Invalid integer `{{value}}`', null, [ name ], { value: v });
  }

  return value;
}

function _number(v, p, name) {
  if (v === undefined || v === null) {
    return v;
  } else if (typeof v === 'string') {
    v = parseFloat(v);
  }

  if ((typeof v !== 'number') || isNaN(v)) {
    throw ValidationException('Invalid number `{{value}}`', null, [ name ], { value: v });
  }

  return v;
}

function _string(v, p, name) {
  if (v === undefined || v === null) {
    return v;
  }

  if (typeof v === 'number') {
    v = String(v);
  } else if (typeof v !== 'string') {
    throw ValidationException('Invalid string `{{value}}`', null, [ name ], { value: v });
  }

  return v;
}

function _boolean(v, p, name) {
  if (v === undefined || v === null) {
    return v;
  }

  if (typeof v === 'number') {
    v = Boolean(v);
  } else if (typeof v !== 'boolean') {
    throw ValidationException('Invalid boolean `{{value}}`', null, [ name ], { value: v });
  }

  return v;
}

function _array(v, p, name) {
  if (v === undefined || v === null) {
    return v;
  }

  if (!(v instanceof Array)) {
    throw ValidationException('Invalid array `{{value}}`', null, [ name ], { value: v });
  }

  return v;
}

function _object(v, p, name) {
  if (v === undefined || v === null) {
    return v;
  }

  if (Object.prototype.toString.call(v) !== '[object Object]') {
    throw ValidationException('Invalid object `{{value}}`', null, [ name ], { value: v });
  }

  return v;
}

function _customValidator(CustomType) {
  return function customValidator(v, p, name) {
    if (v === undefined || v === null || v instanceof CustomType) {
      return v;
    }

    throw ValidationException('Invalid ' + CustomType.name + ' `{{value}}`', null, [ name ], { value: v });
  };
}
