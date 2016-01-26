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

* *static* **Model.use(*plugin*)**
* *static* **Model.define(*[name,] type[, attributes]*)**
* *static* **Model.get(*name*)**
* *static* **Model.isDefined(*type|name*)**
* *static* **Model.undefine(*type|name*)**
* *static* **Model.getPrimaryAttributes(*type|name*)**
* **Model.prototype.toJSON()**

### Types API

* *static* **Types.define(*[name,] type[, validator]*)**
* *static* **Types.undefine(*type|name*)**
* *static* **Types.getDefinedNames()**
* *static* **Types.isDefined(*type|name*)**
* *static* **Types.validate(*type|name, value*)**
* *static* **Types.isValidType(*type|name*)**
* *static* **Types.parseType(*type*)**


## Plugins

Model behaviours may be extended through plugins. A plugin is a function executed after a Model prototype has been processed, and before it has been registered. The function receives the Model type, and the specified attributes definitions (any returned value from a plugin function will be ignored).

For example :

```javascript
Model.use(function fooPlugin(type, attributes) {
  type.prototype.foo = function () { return 'Hello World!'; };
});

const Foo = Model.define(function Foo() {});

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

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
