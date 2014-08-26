
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

    var foo2 = Foo2();

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
    var foo3;

    foo3 = Foo3({ id: 123 });
    foo3.id.should.equal(123);

    foo3 = Foo3({ id: 456, login: 'foo' });
    foo3.id.should.equal(456);
    foo3.login.should.equal('foo');
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

    var m = TestGetter({ options: optionsValue });

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
    var model;

    model = Model.get(typeNameA)();
    model.b.c.foo.should.equal('foo');
    model.toJson().should.eql({ b: { c: { foo: 'foo' } } });

    model = model.fromJson({ b: { c: { foo: 'bar' } } });
    model.b.c.foo.should.equal('bar');
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

    var model = Type({
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


  describe('Testing instance methods', function () {

    it('should define model methods', function () {
      var Type = Model.define('TestDefineMethods', {
        methods: {
          foo: function () {
            return 'bar';
          }
        }
      });

      var type = Type();

      type.foo().should.equal('bar');

      assert.equal(undefined, Type.foo);
    });

  });


  describe('Testing static methods', function () {

    it('should define static methods', function () {
      var Type = Model.define('TestDefineStaticMethods', {
        staticMethods: {
          foo: function () {
            return 'bar';
          }
        }
      });

      var type = Type();

      assert.equal(undefined, type.foo);

      Type.foo().should.equal('bar');

    });

  });

  describe('Testing mapping', function () {

    it('should set from JSON with mapping', function () {
      var Type = Model.define('TestMappingFromJson', {
        attributes: {
          id: { type: 'text' },
          firstName: { type: 'string', alias: 'first_name' },
          lastName: { type: 'string', alias: 'last_name' },
          foo: { type: 'integer', alias: 'bar' }
        }
      });

      var model = Type({
        id: 'abc',
        first_name: 'John',
        last_name: 'Doe',
        foo: 123        // should still map, even if using the actual attribute name
      });

      model.id.should.equal('abc');
      model.firstName.should.equal('John');
      model.lastName.should.equal('Doe');
      model.foo.should.equal(123);

    });


    it('should convert to JSON with mapping', function () {
      var Type = Model.define('TestMappingToJson', {
        attributes: {
          id: { type: 'text', default: '123' },
          firstName: { type: 'string', alias: 'first_name', default: 'John' },
          lastName: { type: 'string', alias: 'last_name', default: 'Smith' },
          foo: { type: 'integer', alias: 'bar' }
        }
      });

      var model = Type();

      model.toJson().should.eql({ id: '123', 'first_name': 'John', 'last_name': 'Smith' });
    });

  });


  describe('Testing arrays', function () {

    it('should create model from array', function () {
      var Type = Model.define('TestArrayFromJson', {
        attributes: {
          values: {
            type: 'integer[]'
          },
          inline: 'string[]',
          objectList: {
            type: 'object[]',
            alias: 'object_list'
          }
        }
      });

      var model = Type({
        values: [ 1, 2, 3 ],
        inline: [ 'a', 'b', 'c' ],
        objectList: [{}, {}, {}]
      });

      model.values.should.eql([1, 2, 3]);
      model.inline.should.eql(['a','b','c']);
      model.objectList.should.eql([{},{},{}]);

      model.toJson().should.eql({values:[1, 2, 3], inline:['a','b','c'], object_list:[{},{},{}]});
    });

  });


});
