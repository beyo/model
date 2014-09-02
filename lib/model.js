/**
Models
*/

const RESTRICTED_PROPERTIES = /^_/;
const RESTRICTED_STATIC_PROPERTIES = /(primaryA|a)ttributes|type/;

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

  return types.isValidType(modelType);
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
  var staticProto;
  var ModelConstructor;
  var typeName;
  var namespace;

  if (types.isValidType(modelType).indexes) {
    throw ModelException('Model type cannot be an array `{{type}}`', null, null, { type: String(modelType) });
  } else if (models[modelType]) {
    throw ModelException('Model already defined `{{type}}`', null, null, { type: String(modelType) });
  }

  options = options || {};
  primaryAttributes = [];
  namespace = _getNamespace(modelType);
  typeName = _getTypeName(modelType);
  attributes = _prepareAttributes(options.attributes || {}, primaryAttributes);
  prototype = _preparePrototype(options.methods || {}, primaryAttributes, modelType, namespace, typeName);
  staticProto = _prepareStaticProto(options.staticMethods || {}, primaryAttributes, options.attributes, prototype._type);

  ModelConstructor = Function('Model, events, attributes',
    'return function ' + typeName + 'Model(data) { ' +
      'if (!(this instanceof ' + typeName + 'Model)){' +
        'return new ' + typeName + 'Model(data);' +
      '}' +
      'Object.defineProperties(this, attributes);' +
      'Model.call(this, data);' +
      'events.emit("create", { ' +
        'type: "' + typeName + '", ' +
        'instance: this' +
      ' });' +
    ' }'
  )(Model, events, attributes);
  util.inherits(ModelConstructor, Model);

  Object.defineProperties(ModelConstructor.prototype, prototype);
  Object.defineProperties(ModelConstructor, staticProto);

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

  if (options.attributes) {
    Object.freeze(options.attributes); // freeze declared attributes
  }

  Object.freeze(attributes);         // freeze attributes list
  Object.freeze(primaryAttributes);  // freeze primary attributes
  //Object.freeze(ModelConstructor.prototype);  // do not freeze to allow extensions

  return ModelConstructor;
}


function getModel(modelType) {
  var typeDef = validateModelTypeName(modelType);

  return models[typeDef.name];
}


function isModelDefined(modelType) {
  var typeDef = validateModelTypeName(modelType);

  return !!models[typeDef.name];
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
    var attributeName;

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

    attributeName = attribute.alias || attr;


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
        if ((this._data[attributeName] === undefined) && (attribute.default !== undefined)) {
          this._isDirty = true;
          return this._data[attributeName] = attribute.default;
        }

        return attribute.parser ? attribute.parser(this._data[attributeName], this._data) : this._data[attributeName];
      },
      set: function setter(value) {
        var prevValue;

        if (attribute.compiler) {
          value = attribute.compiler(value, this._data);
        }

        if (value === undefined && attribute.required) {
          throw ModelException('Attribute `{{name}}` is required', 403, [ attr ], { name: attr }, true);
        } else if (value === null && attribute.notNull) {
          throw ModelException('Attribute `{{name}}` cannot be null', 403, [ attr ], { name: attr }, true);
        }

        prevValue = this._data[attributeName];

        this._data[attributeName] = types.check(attribute.type, value, prevValue, attr);

        if ((prevValue !== undefined) && (prevValue !== this._data[attributeName])) {
          (this._previousData = this._previousData || {})[attributeName] = prevValue;
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

function _prepareStaticProto(staticMethods, primaryAttributes, attributes, modelType) {
  var staticProperties = {};

  Object.keys(staticMethods).forEach(function (methodName) {
    var method = staticMethods[methodName];

    if (RESTRICTED_STATIC_PROPERTIES.test(methodName)) {
      throw ModelException('Invalid static method name `{{name}}`', null, null, { name: methodName });
    }
    if (!(method instanceof Function)) {
      throw ModelException('Static method `{{name}}` is not a function', null, null, { name: methodName });
    }

    staticProperties[methodName] = {
      configurable: false,
      enumerable: true,
      writable: false,
      value: method
    };
  });

  if (attributes) {
    staticProperties.attributes = {
      enumerable: true,
      configurable: false,
      writable: false,
      value: attributes
    };
  }

  staticProperties.primaryAttributes = {
    enumerable: true,
    configurable: false,
    writable: false,
    value: primaryAttributes
  };

  staticProperties.type = {
    enumerable: true,
    configurable: false,
    writable: false,
    value: modelType
  };

  return staticProperties;
}


function _modelTypeValidator(ModelType) {
  return function typeValidator(v) {
    if (v === undefined || v === null || v instanceof ModelType) {
      return v;
    } else if (typeof v === 'object') {
      return ModelType(v);
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
*/
function Model(data) {
  var attributes = this.__proto__.constructor.attributes || {};
  var attrKeys;
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
      get: function isNewModel() {
        var newModel = false;
        var attrValue;

        for (i = 0, ilen = this._primaryAttributes.length; i < ilen && !newModel; ++i) {
          attrValue = this[this._primaryAttributes[i]];

          if ((attrValue === undefined) || (attrValue === null)) {
            newModel = true;
          }
        }

        return newModel;
      }
    }
  });

  if (Array.isArray(data)) {
    for (i = 0, ilen = data.length; i < ilen; ++i) {
      if (this._primaryAttributes[i]) {
        this[this._primaryAttributes[i]] = data[i];
      }
    }
  } else if (data) {
    this.fromJson(data);
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
  var typeDef;
  var Model;
  var keys;
  var key;
  var jsonKey;
  var i;
  var ilen;
  var model;

  if (attributes) {
    keys = Object.keys(attributes);

    for (i = 0, ilen = keys.length; i < ilen; ++i) {
      key = keys[i];

      // test if JSON possess key, or else try the alias if provided
      jsonKey = !(key in json) && attributes[key].alias || key;

      if (json[jsonKey] !== undefined) {
        typeDef = validateModelTypeName(attributes[key].type);
        Model = models[typeDef.name];

        if (Model && json[jsonKey] !== null) {
          if (typeDef.indexes) {
            if (Array.isArray(json[jsonKey])) {
              this[key] = json[jsonKey].map(function (data) {
                return isModel(data) ? data : Model(data);
              });
            } else {
              this[key] = [ isModel(json[jsonKey]) ? json[jsonKey] : Model(json[jsonKey]) ];
            }
          } else {
            this[key] = isModel(json[jsonKey]) ? json[jsonKey] : Model(json[jsonKey]);
          }
        } else {
          this[key] = json[jsonKey];
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
  var value;
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
      value = _toJson(this[key]);

      if (value !== undefined) {
        json[key] = value;
      }
    }
  } else {
    keys = Object.keys(this._data);

    for (i = 0, iLen = keys.length; i < iLen; ++i) {
      key = keys[i];
      value = _toJson(this[key]);

      if (value !== undefined) {
        json[key] = value;
      }
    }
  }

  return json;
}
