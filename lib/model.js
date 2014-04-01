/**
Models
*/

const RESTRICTED_PROPERTIES = /^_/;

var util = require('util');
var types = require('./types');
var isNameValid = require('./name-validator');
var events = new (require('events').EventEmitter)();
var ModelException = require('./exceptions').ModelException;


/**
Each model instance are unique
*/
var uniqueId = 0;

/**
Model types registry
*/
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

Object.freeze(module.exports);


/**
Define a new model prototype.

This will define and register a new model

@param {String} modelName         the model name
@param {Object} options           the model options
@return {Function}                the model constructor
*/
function defineModel(modelName, options) {
  var attributes;
  var prototype;
  var modelConstructor;
  var typeName;
  var namespace;

  if (typeof modelName !== 'string') {
    throw new ModelException('Model name must be a string `' + String(modelName) + '`');
  } else if (!modelName.replace(/\s/g, '').length) {
    throw new ModelException('Model name must not be empty');
  } else if (!isNameValid(modelName)) {
    throw new ModelException('Invalid type name `' + modelName + '`');
  } else if (models[modelName]) {
    throw new ModelException('Model already defined : ' + modelName);
  }

  options = options || {};
  namespace = _getNamespace(modelName);
  typeName = _getTypeName(modelName);
  attributes = _prepareAttributes(options.attributes || {});
  prototype = _preparePrototype(attributes, options.methods || {});

  events.emit('define', {
    modelName: modelName,
    namespace: namespace,
    typeName: typeName,
    attributes: attributes,
    prototype: prototype,
    options: options
  });

  modelConstructor = Function('Model, events', 'var ' + typeName + ' = ' + typeName + 'Model;' +
    'function ' + typeName + 'Model(data) { ' +
      'if (!(this instanceof ' + typeName + 'Model)){' +
        'return new ' + typeName + 'Model(data);' +
      '}' +
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

  modelConstructor.attributes = attributes;

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


function _prepareAttributes(attributes) {
  var modelAttributes = {};

  Object.keys(attributes).forEach(function (attr) {
    var attribute = {};
    var type = attributes[attr];
    var notNull = false;
    var required = false;

    if (type !== null && typeof type === 'object') {
      notNull = !!type.notNull;
      required = !!type.required;
      type = type.type;
    }

    if (!types.isRegistered(type)) {
      throw new ModelException('Unknown property type `' + type + '`');
    }
    if (RESTRICTED_PROPERTIES.test(attr)) {
      throw new ModelException('Invalid property name `' + attr + '`');
    }

    attribute.type = type;
    if (notNull) {
      attribute.notNull = true;
    }
    if (required) {
      attribute.required = true;
    }

    Object.freeze(attribute);

    modelAttributes[attr] = attribute;
  });

  Object.freeze(modelAttributes);

  return modelAttributes;
}


function _preparePrototype(attributes, methods) {
  var protoProperties = {};

  Object.keys(attributes).forEach(function (attr) {
    var attribute = attributes[attr];

    protoProperties[attr] = {
      configurable: false,
      enumerable: true,
      get: function () {
        return this._data[attr];
      },
      set: function (value) {
        if (value === undefined && attribute.required) {
          throw ModelException('Attribute `' + attr + '` is required');
        } else if (value === null && attribute.notNull) {
          throw ModelException('Attribute `' + attr + '` cannot be null');
        }

        this._data[attr] = types.check(attribute.type, value, this._data[attr]);;
      }
    };
  });

  Object.keys(methods).forEach(function (methodName) {
    var method = methods[methodName];

    if (RESTRICTED_PROPERTIES.test(methodName)) {
      throw new ModelException('Invalid method name `' + methodName + '`');
    }
    if (!(method instanceof Function)) {
      throw new ModelException('Method `' + methodName + '` is not a function');
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
Base Model function constructor

@param {Object} data             the model data
*/
function Model(data) {
  var dataKeys = data && Object.keys(data);
  var i, len;

  Object.defineProperties(this, {
    _id: {
      configurable: false,
      enumerable: true,
      writable: false,
      value: ++uniqueId
    },
    _data: {
      configurable: false,
      enumerable: false,
      writable: false,
      value: {}
    }
  });

  if (dataKeys) {
    for (i = 0, len = dataKeys.length; i < len; i++) {
      this[dataKeys[i]] = data[dataKeys[i]];
    }
  }
}
