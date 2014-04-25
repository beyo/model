/**
Models
*/

const RESTRICTED_PROPERTIES = /^_/;

var util = require('util');
var types = require('./types');
var isNameValid = require('./name-validator');
var EventEmitter = require('events').EventEmitter;
var ModelException = require('./exceptions').ModelException;

var events = new EventEmitter();


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
Expose is defined
*/
module.exports.isDefined = isModelDefined;

/**
Expose is model
*/
module.exports.isModel = isModel;


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

This will define a new model

@param {String} modelName         the model name
@param {Object} options           the model options
@return {Function}                the model constructor
*/
function defineModel(modelName, options) {
  var primaryAttributes;
  var attributes;
  var prototype;
  var ModelConstructor;
  var typeName;
  var namespace;

  if (typeof modelName !== 'string') {
    throw ModelException('Model name must be a string `{{name}}`', null, null, { name: String(modelName) });
  } else if (!modelName.replace(/\s/g, '').length) {
    throw ModelException('Model name must not be empty`');
  } else if (!isNameValid(modelName)) {
    throw ModelException('Invalid type name `{{name}}`', null, null, { name: String(modelName) });
  } else if (models[modelName]) {
    throw ModelException('Model already defined `{{name}}`', null, null, { name: String(modelName) });
  }

  options = options || {};
  primaryAttributes = [];
  namespace = _getNamespace(modelName);
  typeName = _getTypeName(modelName);
  attributes = _prepareAttributes(options.attributes || {}, primaryAttributes);
  prototype = _preparePrototype(attributes, options.methods || {});

  prototype._primaryAttributes = {
    enumerable: false,
    configurable: false,
    writable: false,
    value: primaryAttributes
  };

  events.emit('define', {
    modelName: modelName,
    namespace: namespace,
    typeName: typeName,
    attributes: attributes,
    prototype: prototype,
    options: options
  });

  ModelConstructor = Function('Model, events',
    'return function ' + typeName + 'Model(data) { ' +
      'if (!(this instanceof ' + typeName + 'Model)){' +
        'return new ' + typeName + 'Model(data);' +
      '}' +
      'Model.call(this, data);' +
      'events.emit("create", { ' +
        'type: "' + typeName + '", ' +
        'instance: this' +
      ' });' +
    ' }'
  )(Model, events);
  util.inherits(ModelConstructor, Model);

  Object.defineProperties(ModelConstructor.prototype, prototype);

  Object.defineProperty(ModelConstructor, 'attributes', {
    enumerable: true,
    configurable: false,
    writable: false,
    value: attributes
  });


  // Freeze model API
  for (var attr in attributes) {
    Object.freeze(attributes[attr]);
  }
  Object.freeze(attributes);         // freeze attributes list
  Object.freeze(primaryAttributes);  // freeze primary attributes
  //Object.freeze(ModelConstructor.prototype);  // do not freeze to allow extensions

  models[modelName] = ModelConstructor;

  if (!types.isDefined(modelName)) {
    types.define(modelName, options.typeValidator || _modelTypeValidator(ModelConstructor));
  }

  return ModelConstructor;
}


function getModel(modelName) {
  if (typeof modelName !== 'string') {
    throw ModelException('Model name must be a string `{{name}}`', null, null, { name: String(modelName) });
  } else if (!modelName.replace(/\s/g, '').length) {
    throw ModelException('Model name must not be empty`');
  }

  return models[modelName];
}


function isModelDefined(modelName) {
  if (typeof modelName !== 'string') {
    throw ModelException('Model name must be a string `{{name}}`', null, null, { name: String(modelName) });
  } else if (!modelName.replace(/\s/g, '').length) {
    throw ModelException('Model name must not be empty`');
  }

  return !!models[modelName];
}


function _getTypeName(modelName) {
  return modelName.split('.').pop();
}

function _getNamespace(modelName) {
  var ns = modelName.split('.');
  return ns.slice(0, ns.length - 1).join('.');
}


function _prepareAttributes(attributes, primaryAttributes) {
  var modelAttributes = {};

  Object.keys(attributes).forEach(function (attr) {
    var attribute = {};
    var type = attributes[attr];
    var defValue = undefined;
    var primary = false;
    var parser = undefined;
    var compiler = undefined;

    if (!type) {
      type = 'string';
    } else if (type !== null && typeof type === 'object') {
      parser = type.parse;
      compiler = type.compile;
      defValue = type.default;
      primary = type.primary;
      type = type.type;
    }

    if (!types.isDefined(type)) {
      throw ModelException('Unknown property type `{{type}}`', null, null, { type: type });
    } else if (RESTRICTED_PROPERTIES.test(attr)) {
      throw ModelException('Invalid property name `{{name}}`', null, null, { name: attr });
    }

    attribute.type = type;
    if (defValue !== undefined) {
      attribute.default = defValue;
    }
    if (primary) {
      primaryAttributes.push(attr);
    }

    if (parser) {
      if (!(parser instanceof Function)) {
        throw ModelException('Invalid attribute parser `{{name}}`', null, null, { name: attr });
      }

      attribute.parse = parser;
    }

    if (compiler) {
      if (!(compiler instanceof Function)) {
        throw ModelException('Invalid attribute compiler `{{name}}`', null, null, { name: attr });
      }

      attribute.compile = compiler;
    }

    modelAttributes[attr] = attribute;
  });

  return modelAttributes;
}


function _preparePrototype(attributes, methods) {
  var protoProperties = {};

  Object.keys(attributes).forEach(function (attr) {
    var attribute = attributes[attr];

    protoProperties[attr] = {
      configurable: false,
      enumerable: true,
      get: function getter() {
        if ((this._data[attr] === undefined) && (attribute.default !== undefined)) {
          return attribute.default;
        }

        return attribute.parse ? attribute.parse(this._data[attr], this._data) : this._data[attr];
      },
      set: function setter(value) {
        if (value === undefined && attribute.required) {
          throw ModelException('Attribute `{{name}}` is required', 403, [ attr ], { name: attr }, true);
        } else if (value === null && attribute.notNull) {
          throw ModelException('Attribute `{{name}}` cannot be null', 403, [ attr ], { name: attr }, true);
        }

        if (attribute.compile) {
          value = attribute.compile(value, this._data);
        }

        this._data[attr] = types.check(attribute.type, value, this._data[attr], attr);
      }
    };
  });

  Object.keys(methods).forEach(function (methodName) {
    var method = methods[methodName];

    if (RESTRICTED_PROPERTIES.test(methodName)) {
      throw ModelException('Invalid method name `{{name}}`', null, null, { name: methodName });
    }
    if (!(method instanceof Function)) {
      throw ModelException('Method `{{name}}` is not a function', null, null, { name: methodName });
    }

    protoProperties[methods] = {
      configurable: false,
      enumerable: true,
      writable: false,
      value: method
    };
  });

  return protoProperties;
}


function _modelTypeValidator(ModelType) {
  return function typeValidator(v) {
    if (v === undefined || v === null || v instanceof ModelType) {
      return v;
    }

    throw ModelException('Invalid type `{{type}}`', null, null, { type: typeof v });
  }
}


/**
Return true if the given argument is a model instance
*/
function isModel(obj) {
  return obj instanceof Model;
}



/**
Base Model function constructor

@param {Object} data             the model data
*/
function Model(data) {
  var attributes = this.__proto__.constructor.attributes;
  var attrKeys = Object.keys(attributes);
  var attr;
  var i, ilen;

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

  if ((arguments.length === 1) && (data !== null) && (typeof data === 'object')) {
    for (i = 0, ilen = attrKeys.length; i < ilen; ++i) {
      attr = attrKeys[i];
      this[attr] = data[attr] || attributes[attr].default;
    }
  } else if (arguments.length) {
    for (i = 0, ilen = arguments.length; i < ilen; ++i) {
      if (this._primaryAttributes[i]) {
        this[this._primaryAttributes[i]] = arguments[i];
      }
    }
  }
}
util.inherits(Model, EventEmitter);

Object.defineProperties(Model.prototype, {
  'fromJson': {
    enumerable: true,
    configurable: false,
    writable: false,
    value: modelFromJson
  },
  'toJson': {
    enumerable: true,
    configurable: false,
    writable: false,
    value: modelToJson
  }
});


function modelFromJson(json) {
  var attributes = this.__proto__.constructor.attributes;
  var keys;
  var key;
  var i;
  var ilen;

  if (attributes) {
    keys = Object.keys(attributes);

    for (i = 0, ilen = keys.length; i < ilen; ++i) {
      key = keys[i];

      if (json[key] !== undefined) {
        this[key] = json[key];
      }
    }
  } else {
    keys = Object.keys(json);

    for (i = 0, ilen = keys.length; i < ilen; ++i) {
      key = keys[i];

      this._data[key] = json[key];
    }
  }
}

function modelToJson() {
  var json = {};
  var attributes = this.__proto__.constructor.attributes;
  var keys;
  var key;
  var i;
  var ilen;

  if (attributes) {
    keys = Object.keys(attributes);

    for (i = 0, ilen = keys.length; i < ilen; ++i) {
      key = keys[i];

      json[key] = this[key];
    }
  } else {
    keys = Object.keys(this._data);

    for (i = 0, ilen = keys.length; i < ilen; ++i) {
      key = keys[i];

      json[key] = this._data[key];
    }
  }

  return json;
}
