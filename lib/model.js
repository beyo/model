/**
Models
*/

const RESTRICTED_PROPERTIES = /^_/;

var util = require('util');
var types = require('./types');
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


function validateModelTypeName(modelType) {
  if (typeof modelType !== 'string') {
    throw ModelException('Model type name must be a string `{{type}}`', null, null, { type: String(modelType) });
  } else if (!modelType.replace(/\s/g, '').length) {
    throw ModelException('Model type name must not be empty`');
  }

  types.isValidType(modelType);
}

/**
Define a new model prototype.

This will define a new model

@param {String} modelType         the model type name
@param {Object} options           the model options
@return {Function}                the model constructor
*/
function defineModel(modelType, options) {
  var primaryAttributes;
  var attributes;
  var prototype;
  var ModelConstructor;
  var typeName;
  var namespace;

  validateModelTypeName(modelType);

  if (models[modelType]) {
    throw ModelException('Model already defined `{{type}}`', null, null, { type: String(modelType) });
  }

  options = options || {};
  primaryAttributes = [];
  namespace = _getNamespace(modelType);
  typeName = _getTypeName(modelType);
  attributes = _prepareAttributes(options.attributes || {}, primaryAttributes);
  prototype = _preparePrototype(attributes, options.methods || {});

  prototype._primaryAttributes = {
    enumerable: false,
    configurable: false,
    writable: false,
    value: primaryAttributes
  };

  events.emit('define', {
    modelType: modelType,
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

  models[modelType] = ModelConstructor;

  if (!types.isDefined(modelType)) {
    types.define(modelType, options.typeValidator || _modelTypeValidator(ModelConstructor));
  }

  return ModelConstructor;
}


function getModel(modelType) {
  validateModelTypeName(modelType);

  return models[modelType];
}


function isModelDefined(modelType) {
  validateModelTypeName(modelType);

  return !!models[modelType];
}


function _getTypeName(modelType) {
  return modelType.split('.').pop();
}

function _getNamespace(modelType) {
  var ns = modelType.split('.');
  return ns.slice(0, ns.length - 1).join('.');
}


function _prepareAttributes(attributes, primaryAttributes) {
  Object.keys(attributes).forEach(function (attr) {
    var attribute = attributes[attr];

    if (RESTRICTED_PROPERTIES.test(attr)) {
      throw ModelException('Invalid property name `{{name}}`', null, null, { name: attr });
    } else if (typeof attribute === 'string') {
      attributes[attr] = attribute = {
        type: attribute//,
        //default: undefined
        //primary: false,
        //parser: undefined,
        //compiler: undefined
      };
    }

    if (!attribute.type) {
      attribute.type = 'string';
    }

    if (!types.isDefined(attribute.type)) {
      throw ModelException('Unknown property type `{{type}}`', null, null, { type: attribute.type });
    } else if (attribute.parser && !(attribute.parser instanceof Function)) {
      throw ModelException('Invalid attribute parser `{{name}}`', null, null, { name: attr });
    } else if (attribute.compiler && !(attribute.compiler instanceof Function)) {
      throw ModelException('Invalid attribute compiler `{{name}}`', null, null, { name: attr });
    }

    if (attribute.primary) {
      primaryAttributes.push(attr);
    }

  });

  return attributes;
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
  var model;

  if (attributes) {
    keys = Object.keys(attributes);

    for (i = 0, ilen = keys.length; i < ilen; ++i) {
      key = keys[i];

      if (json[key] !== undefined) {
        if (isModelDefined(attributes[key].type)) {
          model = getModel(attributes[key].type)();

          this[key] = model.fromJson(json[key]);
        } else {
          this[key] = json[key];
        }
      }
    }
  } else {
    keys = Object.keys(json);

    for (i = 0, ilen = keys.length; i < ilen; ++i) {
      key = keys[i];

      this._data[key] = json[key];
    }
  }

  return this;
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

      if (isModel(this[key])) {
        json[key] = this[key].toJson();
      } else {
        json[key] = this[key];
      }
    }
  } else {
    keys = Object.keys(this._data);

    for (i = 0, ilen = keys.length; i < ilen; ++i) {
      key = keys[i];

      if (isModel(this._data[key])) {
        json[key] = this._data[key].toJson();
      } else {
        json[key] = this._data[key];
      }
    }
  }

  return json;
}
