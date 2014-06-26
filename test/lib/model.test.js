
var Model = require('../../lib/model');
var EventEmitter = require('events').EventEmitter;

describe('Test Model', function () {

  it('should expose events', function () {
    [
      'on', 'once',
      'addListener', 'removeListener', 'removeAllListeners',
      'listeners'
    ].forEach(function(method) {
      Model[method].should.be.a.Function;
    });
  });

  it('should create a named prototype', function () {
    var options = {
      attributes: {
        id: { type: 'int', required: true },
        login: 'string'
      }
    };

    Model.define('Foo1', options).should.have.ownProperty('name').and.equal('Foo1Model');

    Model.get('Foo1').should.be.a.Function.and.have.ownProperty('name').and.equal('Foo1Model');
  });

  it('should instanciate with properties', function () {
    var options = {
      attributes: {
        id: 'int',
        login: 'string'
      }
    };
    var Foo2 = Model.define('Foo2', options);

    var foo2 = new Foo2();

    foo2.should.be.instanceof(EventEmitter);

    foo2.should.have.property('id');
    foo2.should.have.property('login');

    Model.isModel(foo2).should.be.true;
  });

  it('should get the initial value set', function () {
    var options = {
      attributes: {
        id: 'int',
        login: 'string'
      }
    };
    var Foo3 = Model.define('Foo3', options);

    var foo3 = new Foo3({ id: 123 });

    foo3.id.should.equal(123);
  });

  it('should fail to define invalid models', function () {
    var options = {
      attributes: {
        id: 'int',
        login: 'string'
      }
    };

    [
      null, true, false, {}, [], -123, 0, 123, '', '  In-valid'
    ].forEach(function (modelType) {
      +function () { Model.define(modelType, options); }.should.throw();
    });

    Model.define('Foo4', options);
    (function () { Model.define('Foo4', options); }).should.throw();
  });

  it('should fail getting models', function () {
    [
      null, true, false, {}, [], -123, 0, 123, '', '  In-valid'
    ].forEach(function (modelType) {
      +function () { Model.isDefined(modelType); }.should.throw();
      +function () { Model.get(modelType); }.should.throw();
    });

  });

  it('should allow custom getter / setter', function () {
    var options = {
      attributes: {
        options: {
          type: 'string',
          parser: function (val, data) { return JSON.parse(val); },
          compiler: function (val, data) { return JSON.stringify(val); }
        }
      }
    };

    var TestGetter = Model.define('testGetter', options);
    var optionsValue = {'a': 1, 'b': 2};

    var m = new TestGetter({ options: optionsValue });

    m._data['options'].should.be.a.String.and.equal(JSON.stringify(optionsValue));
    m.options.should.not.equal(optionsValue);
    m.options.should.be.an.Object.and.eql(optionsValue);
  });


  it('should handle nested properties', function () {
    var typeNameA = 'testNestedModelTypeA';
    var typeNameB = 'testNestedModelTypeB';
    var typeNameC = 'testNestedModelTypeC';
    var TypeC = Model.define(typeNameC, {
      attributes: {
        foo: {
          type: 'text',
          default: 'foo'
        }
      }
    });
    var TypeB = Model.define(typeNameB, {
      attributes: {
        c: {
          type: typeNameC,
          get default() { return Model.get(typeNameC)(); }
        }
      }
    });
    var TypeA = Model.define(typeNameA, {
      attributes: {
        b: {
          type: typeNameB,
          get default() { return Model.get(typeNameB)(); }
        }
      }
    });

    var model = Model.get(typeNameA)();

    model.toJson().should.eql({ b: { c: { foo: 'foo' } } });
    model = model.fromJson({ b: { c: { foo: 'bar' } } });
    model.toJson().should.eql({ b: { c: { foo: 'bar' } } });

  });

  it('should preserve previous values', function () {
    var Type = Model.define('TestPerviousValuesA', {
      attributes: {
        id: 'integer',
        foo: 'text',
        bar: {
          type: 'timestamp',
          get default() { return new Date(); }
        }
      }
    });

    var model = new Type({
      id: 123,
      foo: 'Hello'
    });

    assert.equal(model._previousData, undefined);

    model._isDirty.should.be.false;

    model.foo = 'World!';

    model.foo.should.equal('World!');
    model._previousData.should.eql({ foo: 'Hello' });

    model._isDirty.should.be.true;

    model._isDirty = false;

    assert.equal(model._previousData, undefined);

    model._isDirty.should.be.false;

  });


});
