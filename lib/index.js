/**
All defined types should be fetched from the module's method
*/

var types = require('./types');
var events = new (require('events').EventEmitter)();
var models = {};

var Model = function Model(properties, data) {
  Object.defineProperties(this, properties);
  Object.defineProperty(this, 'data', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: data || {}
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

  events.emit('modelCreate', {
    modelName: modelName,
    namespace: namespace,
    typeName: typeName,
    constructor: modelConstructor,
    properties: properties,
    options: options
  });

  Object.freeze(modelConstructor);

  models[modelName] = modelConstructor;

  // FIXME : see types module
  //types.register(modelName, modelConstructor);

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

    // TODO : add value parser proxy

    protoProperties[prop] = {
      configurable: false,
      enumerable: true,
      get: function () {
        return this.data[prop];
      },
      set: function (value) {
        this.data[prop] = value;
      }
    };
  });

  return protoProperties;
};
