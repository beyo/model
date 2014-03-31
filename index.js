/**
All defined types should be fetched from the module's method
*/

const RESTRICTED_PROPERTIES = /^_data$/;

var Model = require('./lib/model');
//var Collection = require('./lib/collection');
var types = require('./lib/types');
var events = new (require('events').EventEmitter)();
var util = require('util');

var models = {};


/**
Define a new model prototype
*/
module.exports.define = defineModel;

/**
Expose models
*/
module.exports.get = getModel;

/**
Expose types module
*/
module.exports.types = types;

/**
Expose exceptions
*/
module.exports.exceptions = {
  ModelsException: ModelsException
};


//module.exports.Model = Model;
//module.exports.Collection = Collection;

/**
Expose event methods
*/
[
  'on', 'once',
  'addListener', 'removeListener', 'removeAllListeners',
  'listeners'
].forEach(function(method) {
  Object.defineProperty(module.exports, method, {
    enumerable: true,
    configurable: false,
    writable: false,
    value: function () {
      return events[method].apply(events, arguments);
    }
  });
});


/**
Define a new model prototype.

This will define and register a new model

@param {String} modelName         the model name
@param {Object} options           the model options
@return {Function}                the model constructor
*/
function defineModel(modelName, options) {
  var prototype;
  var modelConstructor;
  var typeName;
  var namespace;

  if (typeof modelName !== 'string') {
    throw new ModelsException('Invalid model name' + String(modelName));
  }
  if (models[modelName]) {
    throw new ModelsException('Model already defined : ' + modelName);
  }

  options = options || {};
  namespace = _getNamespace(modelName);
  typeName = _getTypeName(modelName);
  prototype = _preparePrototype(options.properties || {}, options.methods || {});

  events.emit('define', {
    modelName: modelName,
    namespace: namespace,
    typeName: typeName,
    prototype: prototype,
    options: options
  });

  modelConstructor = Function('Model, events', 'var ' + typeName + ' = ' + typeName + 'Model;' +
    'function ' + typeName + 'Model(data) { ' +
      'Model.call(this, data);' +
      'events.emit("create", { ' +
        'type: "' + typeName + '", ' +
        'instance: this' +
      ' });' +
    ' }' +
    'return ' + typeName + ';'
  )(Model, events);

  Object.defineProperties(modelConstructor.prototype, prototype);
  Object.freeze(modelConstructor.prototype);

  models[modelName] = modelConstructor;

  if (!types.isRegistered(modelName)) {
    types.register(modelName, options.typeValidator || _modelValidator(modelConstructor));
  }

  return modelConstructor;
};



function getModel(modelName) {
  return models[modelName];
}


function _getTypeName(modelName) {
  return modelName.split('.').pop();
}


function _getNamespace(modelName) {
  var ns = modelName.split('.');
  return ns.slice(0, ns.length - 1);

}

function _preparePrototype(properties, methods) {
  var protoProperties = {};

  Object.keys(properties).forEach(function (prop) {
    var type = properties[prop];
    var notNull = false;
    var required = false;

    if (type !== null && typeof type === 'object') {
      notNull = !!propertyType.notNull;
      required = !!propertyType.required;
      type = type.type;
    }

    if (!types.isRegistered(type)) {
      throw new ModelsException('Unknown property type `' + type + '`');
    }
    if (RESTRICTED_PROPERTIES.test(prop)) {
      throw new ModelsException('Invalid property name `' + prop + '`');
    }

    protoProperties[prop] = {
      configurable: false,
      enumerable: true,
      get: function () {
        return this._data[prop];
      },
      set: function (value) {
        if (value === undefined && required) {

        }
        this._data[prop] = types.check(type, value, this._data[prop]);;
      }
    };
  });

  Object.keys(methods).forEach(function (methodName) {
    var method = methods[methodName];

    if (RESTRICTED_PROPERTIES.test(methodName)) {
      throw new ModelsException('Invalid method name `' + methodName + '`');
    }
    if (!(method instanceof Function)) {
      throw new ModelsException('Method `' + methodName + '` is not a function');
    }

    protoProperties[methods] = {
      configurable: false,
      enumerable: true,
      writable: false,
      value: method
    };
  });

  return protoProperties;
};



function _modelValidator(ModelType) {
  return function typeValidator(v) {
    if (v === undefined || v === null || v instanceof ModelType) {
      return v;
    }

    throw new (exceptions.ParseException)('Invalid type `' + (typeof v) + '`');
  }
};


/**
Models Exception
*/
function ModelsException(msg) {
  msg && (this.message = msg);
  Error.apply(this, arguments);
  Error.captureStackTrace(this, this.constructor);
};
util.inherits(ModelsException, Error);
ModelsException.prototype.name = ModelsException.name;
