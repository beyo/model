/**
Models
*/
'use strict';

const $name = Symbol('name');
const $attributes = Symbol('attributes');
const $primary = Symbol('primary');

const util = require('util');
const nameValidator = require('var-validator');
const errorFactory = require('error-factory');
const types = require('./types');
//const EventEmitter = require('promise-events').EventEmitter;

const ModelError = errorFactory('beyo.ModelError');

const nameValidatorOptions = {
  enableScope: true,
  enableBrackets: false,
  allowUpperCase: true,
  allowLowerCase: true
};


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
    if (typeof name !== 'string') {
      attributes = type;
      type = name;
      name = type.name;
    }

    if (!nameValidator.isValid(name, nameValidatorOptions)) {
      throw new ModelError('Invalid type name');
    } else if ((type === Model) || !(type.prototype instanceof Model)) {
      throw new ModelError('Invalid type');
    }

    attributes = attributes || {};

    Object.defineProperties(type.prototype, {
      [$name]: {
        enumerable: false,
        configurable: false,
        writable: false,
        value: name
      },
      [$primary]: {
        enumerable: false,
        configurable: false,
        writable: false,
        value: collectPrimaryAttributes(attributes)
      },
      [$attributes]: {
        enumerable: false,
        configurable: false,
        writable: false,
        value: defineAttributes(attributes, type.prototype)
      }
    });

    models[name] = type;

    return type;
  }

  /**
  Get a model type by name

  @param name {string}
  @return {Model}
  */
  static get(name) {
    if (!name || (typeof name !== 'string')) {
      throw new ModelError('Invalid model name');
    } else if (!(name in models)) {
      throw new ModelError('Unknown model name');
    }

    return models[name];
  }

  /**
  Check if a model type is defined. Unlike Model.get, this method does not
  throw an error if the model does not exist or if name is not a valid model name.

  @param name {string}
  @return {boolean}
  */
  static isDefined(name) {
    return name && (typeof name === 'string') && (name in models);
  }

  /**
  Return the primary attribute names for the given model type. If the
  model type has no primary attribute, an empty array is returned.

  @param name {string}
  @return {array}
  */
  static getPrimaryAttributes(name) {
    if (!name || (typeof name !== 'string')) {
      throw new ModelError('Invalid model name');
    } else if (!(name in models)) {
      throw new ModelError('Unknown model name');
    }

    return models[name].prototype[$primary] || [];
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
  let propertyValue;

  return {
    enumerable: true,
    configurable: false,
    get: typeof attribute['compile'] === 'function' ? function () {
      return attributes['compile'](propertyValue);
    } : function () {
      return propertyValue;
    },
    set: typeof attribute['parse'] === 'function' ? function (value) {
      // TODO : check type

      propertyValue = attribute['parse'](value);
    } : function (value) {
      // TODO : check type

      propertyValue = value;
    }
  };
}



/**
Set the model's attributes' default values

@param model {Model}
@param attributes {object}
*/
function initAttributes(model, data) {
  const attributes = model.__proto__[$attributes];
  const names = Object.keys(attributes);

  for (let i = 0, iLen = names.length; i < iLen; ++i) {
    let name = names[i];
    let attribute = attributes[name];

    if ('alias' in attribute && attribute['alias'] in data) {
      model[name] = valueToModel(data[attribute['alias']], attribute);
    } else if (name in data) {
      model[name] = valueToModel(data[name], attribute);
    } else if ('default' in attribute) {
      model[name] = attributes[name]['default'];
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