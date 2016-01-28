# Beyo Model (development version)

A module to define models.

This module is not about database and does not provide a persistence layer. It does, however, provide globally available typed models, extendable through various modules. For persistence, see [model mappers](https://github.com/beyo/model-mapper). For validations, see [model validation](https://github.com/beyo/model-validation).


## Features

* Strong type basic validation support
* Array support
* Extendable through model plugins


## Install

*This version is in development mode at the moment.*


## Usage

```javascript
const Model = require('beyo-model');

const fooModelAttributes = {
    // attributes definition here
};

class FooModel extends Model {
    // Methods here (i.e. getters, setters, etc.)
}


Model.define(FooModel, fooModelAttributes);
// or
Model.define('FooModel', FooModel, fooModelAttributes);
```

```javascript
const Model = require('beyo-model');

const FooModel = Model.get('FooModel')

let foo = new FooModel();
```


## Models

### Model API

* *static* **Model.use(*plugin*)** - Use the specified plugin when defining new models. 
* *static* **Model.define(*[name,] type[, attributes]*)** *:Model* - Define a new type using the specified (optional) attributes. If the name is not specified, the type name is used.
* *static* **Model.get(*name*)** *:Model* - Return a defined model.
* *static* **Model.isDefined(*type|name*)** *:boolean* - Return `true` if and only if the specified model type is defined. Returns `false` otherwise.
* *static* **Model.undefine(*type|name*)** *:Model* - Undefine the specified model type and return it. If the specified type is not defined, an error will be thrown. Check with `isDefined`.
* *static* **Model.getPrimaryAttributes(*type|name*)** *:array* - Return an array of primary attributes for this model type.
* **Model.prototype.constructor(*json*)** *:Model* - Create a new model instance, optionally passing data to import.
* **Model.prototype.toJSON()** *:object* - Return the model as a JSON object. Useful when exporting. To import the data back, create a new Model instance passing the JSON object as first (and only) constructor argument.


### Attributes

Model attributes are defined separately from the model. This will eventually be replaced by annotations at some point. All attribute properties are optional and may be a value or a getter.

* **type** - A string value defining the attribute's `type`
* **alias** - A string value representing an alias name for the attribute. This setting is used when importing JSON data. Useful, for example, when importing a dataset row directly into the model.
* **default** - When creating a new model, define the default value for this attribute.

**Example:**

```js
const attributes = {
  id: {
    type: 'integer'
  },
  entityName: {
    type: 'string',
    alias: 'entity_name'
  },
  data: {},
  tag: {
    default: null
  },
  createdAt: {
    type: 'date'
    alias: 'created_at',
    get default() { return new Date(); }
  }
};
```


## Types

While having a loose-typed language make things more dynamic and easy to manage, application models do require a certain level of validation. For example, a *name* may not be a number, and a *quantity* may not be an array of date values. In this sense, model attributes should be predictable.

### Types API

The Types API is used internally and should normally not be tempered with.

* *static* **Types.define(*[name,] type[, validator]*)** - Define a new `type`, a constructor function or class, defined by `name`, being validated by the given `validator`, a function receiving a value and returning the validated value or throwing an error.
* *static* **Types.undefine(*type|name*)** - Undefine the given type and return it's `validator` function.
* *static* **Types.getDefinedNames()** - Return an array of all defined types, including primitives.
* *static* **Types.isDefined(*type|name*)** - Check if the given type is defined and return `true`. Returns `false` òtherwise.
* *static* **Types.validate(*type|name, value*)** - Validate the given `value` as the specified `type` (or type `name`) and return the validated `value`.
* *static* **Types.isValidType(*type|name*)** - Only check that the specified `type` (or type `name`) is valid. This function does not check whether the type is actually already defined.
* *static* **Types.parseType(*type|name*)** - Parse the given `type` (or type `name`) and return an object corresponding to the formatted `name` and a boolean value indicating if the specified value `isArray` of that type.


## Plugins

Model behaviours may be extended through plugins. A plugin is a function executed after a Model prototype has been processed, and before it has been registered. The function receives the Model type, and the specified attributes definitions (any returned value from a plugin function will be ignored).

**Example:**

```javascript
Model.use(function fooPlugin(type, attributes) {
  type.prototype.foo = function () { return 'Hello World!'; };
});

const Foo = Model.define(class Foo extends Model {});

const foo = new Foo();

console.log(foo.foo());
// -> "Hello World!"
```

### Official plugins

* **beyo-model-validator** *(soon)*
* **beyo-model-mapper** *(soon)*


## Contribution

All contributions welcome! Every PR **must** be accompanied by their associated
unit tests!


## License

The MIT License (MIT)

Copyright (c) 2016 Mind2Soft <yanick.rochon@mind2soft.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
