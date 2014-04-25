
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
      (function () { Model.define(modelType, options); }).should.throw();
    });

    Model.define('Foo4', options);
    (function () { Model.define('Foo4', options); }).should.throw();
  });

  it('should allow custom getter / setter', function () {
    var options = {
      attributes: {
        options: {
          type: 'string',
          parse: function (val, data) { return JSON.parse(val); },
          compile: function (val, data) { return JSON.stringify(val); }
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


  it('should handle nested properties');

});
