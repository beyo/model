/**
Models
*/
'use strict';

const $name = Symbol('name');
const $attributes = Symbol('attributes');
const $primary = Symbol('primary');
const $data = Symbol('data');

const util = require('util');
const Types = require('./types');

const ModelError = require('error-factory')('beyo.model.ModelError');

/**
Plugins registry
*/
const plugins = [];

/**
Model types registry
*/
const models = {};

/**
Each model instance are unique
*/
let uniqueId = 0;


/**
Abstract class Model
*/
const Model = module.exports = class Model {

  /**
  Register model plugin to add behaviours and functionalities. These
  plugins will be called every time a Model is defined. The expected plugin
  function should receive two argument; the Model object and the defining
  attributes object. (Any returned value will be ignored.)

  Usage:

    Model.use(function fooPlugin(Type, attributes) {
      Type.prototype.foo = function () { return 'Hello World!'; };
    });

    const Foo = Model.define(function Foo() {});

    const foo = new Foo();

    console.log(foo.foo());
    // -> "Hello World!"

  Plugin functions are called after the type's attributes' getters and
  setters are defined.

  @param plugin {function}
  */
  static use(plugin) {
    if (typeof plugin !== 'function') {
      throw new ModelError('Plugin is not a function');
    }

    if (plugins.indexOf(plugin) === -1) {
      plugins.push(plugin);
    }
  }

  /**
  Define a new model type

  Usage:

    Model.define(CustomModel);
    Model.define('my.FooModel', CustomModel);

  If only a type is specified, the name will be set to the type's name.
  This method returns a promise resolving with type.

  @param name {string} (optional)       the type name (may be a namespace)
  @param type {Model}                   the model type extending Model
  @param attributes {object} (optional) the model's attributes definition
  @return Promise
  */
  static define(name, type, attributes) {
    if (name && typeof name !== 'string') {
      attributes = type;
      type = name;
      name = type.name;
    }

    if (!type || (type === Model) || !(type.prototype instanceof Model)) {
      throw new ModelError('Invalid model');
    }

    const typeDef = Types.parseType(name);

    Types.define(typeDef.name, type);

    attributes = attributes || {};

    Object.defineProperties(type.prototype, {
      [$name]: {
        enumerable: false,
        configurable: true,
        writable: false,
        value: name   // preserve original name
      },
      [$primary]: {
        enumerable: false,
        configurable: true,
        writable: false,
        value: collectPrimaryAttributes(attributes)
      },
      [$attributes]: {
        enumerable: false,
        configurable: true,
        writable: false,
        value: defineAttributes(attributes, type.prototype)
      }
    });

    for (let i = 0, iLen = plugins.length; i < iLen; ++i) {
      plugins[i](type, attributes);
    }

    return models[typeDef.name] = type;
  }

  /**
  Get a model type by name

  @param name {string}
  @return {Model}
  */
  static get(name) {
    const typeDef = Types.parseType(name);

    if (!(typeDef.name in models)) {
      throw new ModelError('Unknown model name');
    }

    return models[typeDef.name];
  }

  /**
  Check if a model type is defined. Unlike Model.get, this method does not
  throw an error if the model does not exist or if name is not a valid model name.

  @param name {string}
  @return {boolean}
  */
  static isDefined(name) {
    if (name && name.prototype instanceof Model) {
      name = name.name;
    }

    const typeDef = Types.parseType(name);

    return typeDef.name in models;
  }


  /**
  Undefine the specified model. If the model name is not found, this method
  will throw an error. Use isDefined(name) to see if the model exists and can
  safely be undefined.

  @param {name}      the model type name to undefine
  @return {Model}    the deleted model type
  */
  static undefine(name) {
    if (name && name.prototype instanceof Model) {
      name = name.name;
    }

    const typeDef = Types.parseType(name);

    if (!(typeDef.name in models)) {
      throw new ModelError('Unknown model name');
    }

    Types.undefine(typeDef.name);

    const removed = models[typeDef.name];

    delete removed.prototype[$name];
    delete removed.prototype[$primary];
    delete removed.prototype[$attributes];

    delete models[typeDef.name];

    return removed;
  }


  /**
  Return the primary attribute names for the given model type. If the
  model type has no primary attribute, an empty array is returned.

  @param name {string}
  @return {array}
  */
  static getPrimaryAttributes(name) {
    if (name && name.prototype instanceof Model) {
      name = name.name;
    }

    const typeDef = Types.parseType(name);

    if (!(typeDef.name in models)) {
      throw new ModelError('Unknown model name');
    }

    return models[typeDef.name].prototype[$primary];
  }



  /**
  Create a new model with optionally the given data
  */
  constructor(data) {
    if (!($attributes in this.__proto__)) {
      throw new ModelError('Undefined Model instance');
    }

    initAttributes(this, data || {});
  }

  toJson() {
    const json = {};
    const attributes = this.__proto__[$attributes];
    const names = Object.keys(attributes);

    for (let i = 0, iLen = names.length; i < iLen; ++i) {
      let name = names[i];
      let value = this[name];

      if (value instanceof Model) {
        json[name] = value.toJson();
      } else if (value !== undefined) {
        json[name] = value;
      }
    }

    return json;
  }
}




/**
Collect all primary attributes

@param attributes {object}
@return {array}
*/
function collectPrimaryAttributes(attributes) {
  const names = Object.keys(attributes)
  const primary = [];

  for (let i = 0, iLen = names.length; i < iLen; ++i) {
    if (attributes[names[i]].primary) {
      primary.push(names[i]);
    }
  }

  return primary;
}


/**
Define all attributes on the prototype

@param attributes {object}
@param prototype {object}
@return {object}              return the attributes' informations
*/
function defineAttributes(attributes, prototype) {
  const names = Object.keys(attributes)

  for (let i = 0, iLen = names.length; i < iLen; ++i) {
    let name = names[i];

    if (typeof attributes[name] === 'string') {
      attributes[name] = { type: attributes[name] };
    }

    Object.defineProperty(prototype, name, createProperty(name, attributes[name]));
  }

  Object.freeze(attributes);

  return attributes;
}


/**
Create the property for the specified attribute and name

@param name {string}       the property name being created
@param attribute {object}  the attribute info
*/
function createProperty(name, attribute) {
  const property = {
    enumerable: true,
    configurable: false,
    get: function get() {
      return this[$data][name];
    }
  };

  if (attribute.type) {
    property.set = function set(value) {
      this[$data][name] = Types.validate(attribute.type, value);
    };
  } else {
    property.set = function set(value) {
      //this.emit('update:' + name, this[$data][name], value);
      this[$data][name] = value;
    }
  }

  return property;
}



/**
Set the model's attributes' default values

@param model {Model}
@param attributes {object}
*/
function initAttributes(model, data) {
  const attributes = model.__proto__[$attributes];
  const names = Object.keys(attributes);

  model[$data] = {};

  for (let i = 0, iLen = names.length; i < iLen; ++i) {
    let name = names[i];
    let attribute = attributes[name];

    if (name in data) {
      model[name] = valueToModel(data[name], attribute);
    } else if ('alias' in attribute && attribute['alias'] in data) {
      model[name] = valueToModel(data[attribute['alias']], attribute);
    } else if ('default' in attribute) {
      model[name] = attribute['default'];
    }
  }
}


/**
Make sure that, if the given value is assigned to a type inherited from Model,
and that the value is not an instance of Model, a new instance is created.

@param value {any}         some value
@param attribute {object}  the attribute being set
@return {any}              a proper Model instance when necessary
*/
function valueToModel(value, attribute) {
  if (Model.isDefined(attribute['type']) && !(value instanceof Model)) {
    const Type = Model.get(attribute['type']);

    return new Type(value);
  } else {
    return value;
  }
}