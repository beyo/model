
var util = require('util');

var exceptions;
var registry;
var primitives;


/**
  ============ Exceptions ============
*/
exceptions = module.exports.exceptions = {};

[
  'TypeException',
  'ParseException'
].forEach(function (exceptionType) {
  exceptions[exceptionType] = Function('', 'return function ' + exceptionType + '(msg) {'
      + 'msg && (this.message = msg);'
      + 'Error.apply(this, arguments);'
      + 'Error.captureStackTrace(this, this.constructor);'
    + '}')();
  util.inherits(exceptions[exceptionType], Error);
  exceptions[exceptionType].prototype.name = exceptionType;
});

Object.freeze(module.exports.exceptions);


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


/**
Register a new type.
*/
module.exports.register = function registerType(type, validator) {
  if (typeof type !== 'string') {
    throw new (exceptions.TypeException)('Type name must be a string `' + type + '`');
  }
  if (!(validator instanceof Function)) {
    throw new (exceptions.TypeException)('Not a validator for type `' + type + '`');
  }
  if (primitives[type.toLocaleLowerCase()]) {
    throw new (exceptions.TypeException)('Cannot override primitive type `' + type + '`');
  }

  return registry[type] = validator;
};

/**
Unregister a type.
*/
module.exports.unregister = function unregisterType(type) {
  var validator;

  if (typeof type !== 'string') {
    throw new (exceptions.TypeException)('Type name must be a string `' + type + '`');
  }
  if (primitives[type.toLocaleLowerCase()]) {
    throw new (exceptions.TypeException)('Cannot unregister primitive type `' + type + '`');
  }

  validator = registry[type];

  delete registry[typeName];

  return validator;
};

/**
Check value agains type
*/
module.exports.check = function check(type, value, previous) {
  if (typeof type !== 'string') {
    throw new (exceptions.TypeException)('Type name must be a string `' + type + '`');
  }

  validator = primitives[type.toLocaleLowerCase()] || registry[type];

  if (!validator) {
    console.log( (new (exceptions.TypeException)('Unknown type `' + type + '`')).toString() );
    throw new (exceptions.TypeException)('Unknown type `' + type + '`');
    return;
  }

  return validator(value, previous);
};

/**
Return all registered type names
*/
module.exports.registeredNames = function registeredNames() {
  return Object.keys(primitives).concat(Object.keys(registry));
};

Object.freeze(module.exports);


/**
  ============= Parsers =============
**/

// primitive types

function _notImplemented() {
  throw 'Not implemented';
}

function _integer(v) {
  var value;

  if (v === undefined || v === null) {
    return v;
  }

  if (typeof v !== 'number') {
    throw new (exceptions.ParseException)('Invalid integer `' + v + '`');
  }

  value = parseInt(v);

  if (isNaN(value) || (value !== v)) {
    throw new (exceptions.ParseException)('Invalid integer `' + v + '`');
  }

  return value;
}

function _number(v) {
  var value;

  if (v === undefined || v === null) {
    return v;
  }

  if (typeof v !== 'number') {
    throw new (exceptions.ParseException)('Invalid number `' + v + '`');
  }

  value = parseFloat(v);

  if (isNaN(value)) {
    throw new (exceptions.ParseException)('Invalid number `' + v + '`');
  }

  return value;
}

function _string(v) {
  if (v === undefined || v === null) {
    return v;
  }

  if (typeof v === 'number') {
    v = String(v);
  } else if (typeof v !== 'string') {
    throw new (exceptions.ParseException)('Invalid string `' + v + '`');
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
    throw new (exceptions.ParseException)('Invalid boolean `' + v + '`');
  }

  return v;
}

function _array(v) {
  if (v === undefined || v === null) {
    return v;
  }

  if (!(v instanceof Array)) {
    throw new (exceptions.ParseException)('Invalid array `' + v + '`');
  }

  return v;
}

function _object(v) {
  if (v === undefined || v === null) return v;

  if (Object.prototype.toString.call(v) !== '[object Object]') {
    throw new (exceptions.ParseException)('Invalid object `' + (typeof v) + '`');
  }

  return v;
}
