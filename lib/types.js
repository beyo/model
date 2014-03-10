
var util = require('util');

var exceptions;
var primitives;

/**
Export module as a function
*/
module.exports = function getType(type) {
  var typeName;
  var ctx;
  var constructor;

  if (typeof type !== 'string') {
    throw new (exceptions.TypeException)('Type name must be a string : ' + type);
  }

  typeName = type.split('.').pop();
  ctx = _resolve(type);
  constructor = (ctx === module.exports) && primitives[typeName] || ctx[typeName];

  return constructor;
};

/**
  ============ Exceptions ============
*/
exceptions = module.exports.exceptions = {};

[
  'TypeException',
  'ParseException'
].forEach(function (exceptionType) {
  exceptions[exceptionType] = Function('name', 'return function ' + exceptionType + '(msg) { Error.call(this, msg); }')(exceptionType);
  util.inherits(exceptions[exceptionType], Error);
});

Object.freeze(module.exports.exceptions);


/**
  ============ Primitives ============
*/
primitives = module.exports.primitives = {
  'int': _integer,
  'integer': _integer,
  'flaot': _number,
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

Object.freeze(module.exports.primitives);


/**
Register a new type. Thie method is a shortcut
*/
Object.defineProperty(module.exports, 'register', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: _registerType
});

/**
Unregister a new type. Thie method is a shortcut
*/
Object.defineProperty(module.exports, 'unregister', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: _unregisterType
});


function _resolve(type) {
  var ctx = module.exports;
  var path = type.split('.');
  var key;

  while (path.length > 1) {
    key = path.shift();
    ctx = ctx[key] || (ctx[key] = {});
  }

  return ctx;
}

function _registerType(type, constructor) {
  var typeName;
  var ctx;

  if (typeof type !== 'string') {
    throw new (exceptions.TypeException)('Type name must be a string : ' + type);
  }
  if (!(constructor instanceof Function)) {
    throw new (exceptions.TypeException)('Not a constructor for type : ' + type);
  }

  typeName = type.split('.').pop();
  ctx = _resolve(type);

  if (((ctx === module.exports) || (ctx === primitives)) && (primitives[typeName.toLocaleLowerCase()])) {
    throw new (exceptions.TypeException)('Cannot override primitive type : ' + type);
  }

  return ctx[typeName] = constructor;
}

function _unregisterType(type) {
  var typeName;
  var ctx;
  var constructor;

  if (typeof type !== 'string') {
    throw new (exceptions.TypeException)('Type name must be a string : ' + type);
  }

  typeName = type.split('.').pop();
  ctx = _resolve(type);
  constructor = ctx[typeName];

  if (((ctx === module.exports) || (ctx === primitives)) && (primitives[typeName.toLocaleLowerCase()])) {
    throw new (exceptions.TypeException)('Cannot unregister primitive type : ' + type);
  }

  delete ctx[typeName];

  return constructor;
}


/**
  ============= Parsers =============
**/

// primitive types

function _notImplemented() {
  throw 'Not implemented';
}

function _integer(v) {
  var value;

  if (v === undefined || v === null) return v;

  value = parseInt(v);

  if (isNaN(value)) {
    throw new (exceptions.ParseException)('Invalid integer : ' + v);
  }

  return value;
}

function _number(v) {
  var value;

  if (v === undefined || v === null) return v;

  value = parseFloat(v);

  if (isNaN(value)) {
    throw new (exceptions.ParseException)('Invalid number : ' + v);
  }

  return value;
}

function _string(v) {
  if (v === undefined || v === null) return v;

  return String(v);
}

function _boolean(v) {
  if (v === undefined || v === null) return v;

  return Boolean(v);
}

function _array(v) {
  if (v === undefined || v === null) return v;

  return v instanceof Array ? v : [v];
}

function _object(v) {
  if (v === undefined || v === null) return v;

  if (v.constructor !== Object) {
    throw new (exceptions.ParseException)('Invalid object : ' + v);
  }

  return v;
}
