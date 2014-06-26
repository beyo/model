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
  prototype = _preparePrototype(options.methods || {}, primaryAttributes, modelType, namespace, typeName);

  ModelConstructor = Function('Model, events, attributes',
    'return function ' + typeName + 'Model(data, exists) { ' +
      'if (!(this instanceof ' + typeName + 'Model)){' +
        'return new ' + typeName + 'Model(data, exists);' +
      '}' +
      'Object.defineProperties(this, attributes);' +
      'Model.call(this, data, exists);' +
      'events.emit("create", { ' +
        'type: "' + typeName + '", ' +
        'instance: this' +
      ' });' +
    ' }'
  )(Model, events, attributes);
  util.inherits(ModelConstructor, Model);

  Object.defineProperties(ModelConstructor.prototype, prototype);
  Object.defineProperties(ModelConstructor, {
    'attributes': {
      enumerable: true,
      configurable: false,
      writable: false,
      value: options.attributes
    },
    'primaryAttributes': {
      enumerable: true,
      configurable: false,
      writable: false,
      value: primaryAttributes
    },
    'type': {
      enumerable: true,
      configurable: false,
      writable: false,
      value: prototype._type
    }
  });

  if (!types.isDefined(modelType)) {
    types.define(modelType, options.typeValidator || _modelTypeValidator(ModelConstructor));
  }

  // assign
  models[modelType] = ModelConstructor;

  events.emit('define', {
    modelType: modelType,
    namespace: namespace,
    typeName: typeName,
    attributes: attributes,
    constructor: ModelConstructor,
    options: options
  });

  // Freeze model API
  for (var attr in attributes) {
    Object.freeze(attributes[attr]);
  }
  Object.freeze(options.attributes); // freeze declared attributes
  Object.freeze(attributes);         // freeze attributes list
  Object.freeze(primaryAttributes);  // freeze primary attributes
  //Object.freeze(ModelConstructor.prototype);  // do not freeze to allow extensions

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
  var modelAttributes = {};

  Object.keys(attributes).forEach(function (attr) {
    var attribute = attributes[attr];

    if (RESTRICTED_PROPERTIES.test(attr)) {
      throw ModelException('Invalid property name `{{name}}`', null, null, { name: attr });
    } else if (typeof attribute === 'string') {
      attributes[attr] = attribute = {
        type: attribute//,
        //default: undefined
        //primary: false,
        //parse: undefined,
        //compile: undefined
      };
    }

    if (!attribute.type) {
      attribute.type = 'string';
    }

    // LAZY LOADING MODEL TYPES!!!
    //if (!types.isDefined(attribute.type)) {
    //  throw ModelException('Unknown property type `{{type}}`', null, null, { type: attribute.type });
    //} else
    if (attribute.parser && !(attribute.parser instanceof Function)) {
      throw ModelException('Invalid attribute parser `{{name}}`', null, null, { name: attr });
    } else if (attribute.compiler && !(attribute.compiler instanceof Function)) {
      throw ModelException('Invalid attribute compiler `{{name}}`', null, null, { name: attr });
    }

    if (attribute.primary) {
      primaryAttributes.push(attr);
    }

    modelAttributes[attr] = {
      configurable: false,
      enumerable: true,
      get: function getter() {
        if ((this._data[attr] === undefined) && (attribute.default !== undefined)) {
          return this._data[attr] = attribute.default;
        }

        return attribute.parser ? attribute.parser(this._data[attr], this._data) : this._data[attr];
      },
      set: function setter(value) {
        var prevValue = this._data[attr];

        if (value === undefined && attribute.required) {
          throw ModelException('Attribute `{{name}}` is required', 403, [ attr ], { name: attr }, true);
        } else if (value === null && attribute.notNull) {
          throw ModelException('Attribute `{{name}}` cannot be null', 403, [ attr ], { name: attr }, true);
        }

        if (attribute.compiler) {
          value = attribute.compiler(value, this._data);
        }

        this._data[attr] = types.check(attribute.type, value, this._data[attr], attr);

        if ((prevValue !== undefined) && (prevValue !== this._data[attr])) {
          (this._previousData = this._previousData || {})[attr] = prevValue;
        }

        this._isDirty = true;
      }
    };

  });

  return modelAttributes;
}


function _preparePrototype(methods, primaryAttributes, modelType, namespace, typeName) {
  var protoProperties = {};
  var modelTypeProto = {};

  Object.keys(methods).forEach(function (methodName) {
    var method = methods[methodName];

    if (RESTRICTED_PROPERTIES.test(methodName)) {
      throw ModelException('Invalid method name `{{name}}`', null, null, { name: methodName });
    }
    if (!(method instanceof Function)) {
      throw ModelException('Method `{{name}}` is not a function', null, null, { name: methodName });
    }

    protoProperties[methodName] = {
      configurable: false,
      enumerable: true,
      writable: false,
      value: method
    };
  });

  Object.defineProperties(modelTypeProto, {
    canonicalName: {
      enumerable: true,
      configurable: false,
      writable: false,
      value: modelType
    },
    namespace: {
      enumerable: true,
      configurable: false,
      writable: false,
      value: namespace
    },
    name: {
      enumerable: true,
      configurable: false,
      writable: false,
      value: typeName
    }
  });

  protoProperties._primaryAttributes = {
    enumerable: false,
    configurable: false,
    writable: false,
    value: primaryAttributes
  };

  protoProperties._type = {
    enumerable: false,
    configurable: false,
    writable: false,
    value: modelTypeProto
  };

  return protoProperties;
}


function _modelTypeValidator(ModelType) {
  return function typeValidator(v) {
    if (v === undefined || v === null || v instanceof ModelType) {
      return v;
    } else if (typeof v === 'object') {
      return ModelType().fromJson(v);
    }

    throw ModelException('Invalid type `{{type}}`', null, null, { type: typeof v, value: v });
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

@param {Object} data      the model data
@param {boolean} exists   true if the model is not new
*/
function Model(data, exists) {
  var usePrimaryKeys = (data instanceof Array);
  var attributes = this.__proto__.constructor.attributes;
  var attrKeys = Object.keys(attributes);
  var attr;
  var i, ilen;
  var dirty = false;

  Object.defineProperties(this, attributes);
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
    },
    _isDirty: {
      configurable: false,
      enumerable: true,
      get: function isDirty() {
        return dirty;
      },
      set: function isDirty(d) {
        dirty = d;
        if (!d && this._previousData) {
          this._previousData = undefined;
        }
      }
    },
    _isNew: {
      configurable: false,
      enumerable: true,
      writable: true,
      value: !exists
    }
  });

  if (usePrimaryKeys) {
    for (i = 0, ilen = data.length; i < ilen; ++i) {
      if (this._primaryAttributes[i]) {
        this[this._primaryAttributes[i]] = data[i];
      }
    }
  } else if (data) {
    for (i = 0, ilen = attrKeys.length; i < ilen; ++i) {
      attr = attrKeys[i];
      this[attr] = attr in data ? data[attr] : attributes[attr].default;
    }
  }

  this._isDirty = false; // overwrite...
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

      if (this._data[key] && (this._data[key] !== json[key])) {
        (this._previousData = this._previousData || {})[key] = this._data[key];
      }

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
  var iLen;

  function _toJson(val) {
    var arr;
    var j;
    var jLen;

    if (isModel(val)) {
      return val.toJson();
    } else if (val instanceof Array) {
      arr = [];
      for (j = 0, jLen = val.length; j < jLen; ++j) {
        arr.push(_toJson(val[j]));
      }
      return arr;
    } else {
      return val;
    }
  }

  if (attributes) {
    keys = Object.keys(attributes);

    for (i = 0, iLen = keys.length; i < iLen; ++i) {
      key = keys[i];

      json[key] = _toJson(this[key]);
    }
  } else {
    keys = Object.keys(this._data);

    for (i = 0, iLen = keys.length; i < iLen; ++i) {
      key = keys[i];

      json[key] = _toJson(this._data[key]);
    }
  }

  return json;
}
