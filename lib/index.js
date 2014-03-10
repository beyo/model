

var models = module.exports;
var events = module.exports.events = new (require('events').EventEmitter)();

var Model = function Model(properties, data) {
  Object.defineProperties(this, properties);
  Object.defineProperty(this, 'data', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: data || {}
  });
};

/**
Create a new model prototype
*/
module.exports.define = function createModel(modelName, options) {
  var properties;
  var modelConstructor;
  var namespace;

  options = options || {};
  namespace = _getNamespace(modelName);
  modelName = _getModelName(modelName);
  properties = _prepareProperties(options.properties || {});
  modelConstructor = Function('Model, properties', 'return function ' + modelName + 'Model(data) { Model.call(this, properties, data); }')(Model, properties);

  events.emit('modelCreate', modelConstructor, properties, options);

  Object.freeze(modelConstructor);

  models[modelName] = modelConstructor;

  return modelConstructor;
};


function _getModelName(modelName) {
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
