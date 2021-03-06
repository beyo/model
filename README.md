# Beyo Model

A module to define models.

This module is not about database and does not provide a persistence layer. It does, however,
provide globally available typed models, extendable through various modules. For persistence,
see [model mappers](https://github.com/beyo/model-mapper). For validations, see 
[model validation](https://github.com/beyo/model-validation).


## Features

* Asynchronous API through generator functions [`co`](https://github.com/visionmedia/co) compatible.
* Strong type basic validation support
* Event driven
* Extendable through mixin modules
* Frozen objects
* Well structured code.


## Install

```
npm install beyo-model --save
```


## Usage

```javascript
// define a new model
Model.define('Foo', {
  attributes: {
    id: { type: 'integer', primary: true },
    name: { type: 'string', default: '' }
  }
});

// fetching/creating a model
var foo = Model.get('Foo')( 1 );
// -> FooModel { id: 1, name: '' }
```


## Models

### Model API

*TODO*


### Model events

*TODO*


## Collections

Model collections are simply objects wrapping an array with extra methods. It is
important to note that a `Collection` work directly on the provided array of items!
So, use `arr.slice(0)` to copy an array to the `Collection` instance if necessary!

### Collection API

* **find** *(cb:Function)*:*{Object}* - return the first model where the callback
function returns true. The callback receives two arguments; 1) the model item, and
2) the model index within the `Collection`.
* **find** *(value:String)*:*{Object}* - return the first model with any attribute
matching the given value. If the collection is providing a `modelType`, the search
will be limited to the model type's defined attributes.
* **find** *(properties:Object)*:*{Object}* - return the first model with all the
given attributes. Using this search method will ignore the collection's `modelType`
attributes and search all the provided properties.
* **findAll** *(cb:Function)*:*{Object}* - same as `find`, but returns a new `Collection`
with all the matching items.
* **findAll** *(value:String)*:*{Object}* - same as `find`, but returns a new
`Collection` with all the matching items.
* **findAll** *(properties:Object)*:*{Object}* - same as `find`, but returns a new
`Collection` with all the matching items.
* **remove** *(cb:Function)*:*{Object}* - remove and return the first model where
the callback function returns true. The callback receives two arguments; 1) the
model item, and 2) the model index within the `Collection`.
* **remove** *(value:String)*:*{Object}* - remove and return the first model with
any attribute matching the given value. If the collection is providing a `modelType`,
the search will be limited to the model type's defined attributes.
* **remove** *(properties:Object)*:*{Object}* - remove and return the first model
with all the given attributes. Using this search method will ignore the collection's
`modelType` attributes and search all the provided properties.
* **removeAll** *(cb:Function)*:*{Object}* - same as `remove`, but returns the
number of items removed.
* **removeAll** *(value:String)*:*{Object}* - same as `remove`, but returns the
number of items removed.
* **removeAll** *(properties:Object)*:*{Object}* - same as `remove`, but returns the
number of items removed.


## Associated Projects

* **Persistence layer** with [model Mappers](https://github.com/beyo/model-mapper)
* **Validators** with [model validators](https://github.com/beyo/model-validator)


## Contribution

All contributions welcome! Every PR **must** be accompanied by their associated
unit tests!


## License

The MIT License (MIT)

Copyright (c) 2014 Mind2Soft <yanick.rochon@mind2soft.com>

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
