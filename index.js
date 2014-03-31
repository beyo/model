/**
All defined types should be fetched from the module's method
*/

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
  var properties;
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
  properties = _prepareProperties(options.properties || {});
  modelConstructor = Function('Model, properties, events', 'return function ' + typeName + 'Model(data) { ' +
    'Model.call(this, properties, data);' +
    'events.emit("create", { ' +
      'type:"' + typeName + '", ' +
      'instance:this' +
    ' });' +
  ' }')(Model, properties, events);

  events.emit('define', {
    modelName: modelName,
    namespace: namespace,
    typeName: typeName,
    constructor: modelConstructor,
    properties: properties,
    options: options
  });

  Object.freeze(modelConstructor);

  models[modelName] = modelConstructor;

  types.register(modelName, _modelValidator(modelConstructor));

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

function _prepareProperties(properties) {
  var protoProperties = {};

  Object.keys(properties).forEach(function (prop) {
    var propertyType = properties[prop];

    protoProperties[prop] = {
      configurable: false,
      enumerable: true,
      get: function () {
        return this.data[prop];
      },
      set: function (value) {
        this.data[prop] = types.check(propertyType, value, this.data[prop]);;
      }
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
