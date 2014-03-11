/**
All defined types should be fetched from the module's method
*/

var types = require('./types');
var events = new (require('events').EventEmitter)();
var models = {};

var Model = function Model(properties, data) {
  var dataKeys = data && Object.keys(data);
  var i, len;

  Object.defineProperties(this, properties);
  Object.defineProperty(this, 'data', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: {}
  });

  if (dataKeys) {
    for (i = 0, len = dataKeys.length; i < len; i++) {
      this[dataKeys[i]] = data[dataKeys[i]];
    }
  }

  events.emit('create', {
    type: this.constructor.name,
    instance: this
  });
};




module.exports = function getModel(modelName) {
  return models[modelName];
};

/**
Create a new model prototype
*/
module.exports.define = function createModel(modelName, options) {
  var properties;
  var modelConstructor;
  var typeName;
  var namespace;

  options = options || {};
  namespace = _getNamespace(modelName);
  typeName = _getTypeName(modelName);
  properties = _prepareProperties(options.properties || {});
  modelConstructor = Function('Model, properties', 'return function ' + typeName + 'Model(data) { Model.call(this, properties, data); }')(Model, properties);

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

  types.register(modelName, modelConstructor);

  return modelConstructor;
};

/**
Global Model events
*/
module.exports.events = events;

/**
Expose types module
*/
module.exports.types = types;


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
