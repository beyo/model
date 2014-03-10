
var types = require('../lib/types');

describe('Types test', function () {

  it('should expose `ParseException`', function () {
    var e = new (types.exceptions.ParseException);

    e.should.be.instanceOf(Error);
  });

  it('should expose `TypeException`', function () {
    var e = new (types.exceptions.TypeException);

    e.should.be.instanceOf(Error);
  });

  it('should retrieve all primitives', function () {
    [
      'int', 'integer',
      'flaot', 'number',
      'uuid',
      'text', 'string',
      'bool', 'boolean',
      'time', 'date', 'datetime', 'timestamp',
      'array',
      'object'
    ].forEach(function (type) {
      types(type).should.be.a.Function.and.equal(types('primitives.' + type));
    });
  });

  it('should prevent overriding primitives', function () {
    [
      'int', 'integer',
      'flaot', 'number',
      'uuid',
      'text', 'string',
      'bool', 'boolean',
      'time', 'date', 'datetime', 'timestamp',
      'array',
      'object'
    ].forEach(function (type) {
      (function () {
        types.register(type, function foo() {});
      }).should.throw();
      (function () {
        types.register('primitives.' + type, function foo() {});
      }).should.throw();
    });
  });

  it('should prevent unregistering primitives', function () {
    [
      'int', 'integer',
      'flaot', 'number',
      'uuid',
      'text', 'string',
      'bool', 'boolean',
      'time', 'date', 'datetime', 'timestamp',
      'array',
      'object'
    ].forEach(function (type) {
      (function () {
        types.unregister(type);
      }).should.throw();
      (function () {
        types.unregister('primitives.' + type);
      }).should.throw();

      types(type).should.be.a.Function.and.equal(types('primitives.' + type));
    });
  });

});
