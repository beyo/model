
var types = require('../../lib/types');

var util = require('util');

describe('Test Types', function () {

  it('should expose `ValidationException`', function () {
    var e = new (types.exceptions.ValidationException);

    e.should.be.instanceOf(Error);
  });

  it('should expose `TypeException`', function () {
    var e = new (types.exceptions.TypeException);

    e.should.be.instanceOf(Error);
  });

  it('should not allow registering invalid types', function () {
    [
      undefined, null, false, true, '', '\n', ' ', '*', '1', -1, 0, 1, {}, [],
    ].forEach(function (invalidType) {
      (function () { types.register(invalidType, function () {}); }).should.throw();
    });
  });

  it('should fail at unregistering primitives', function () {
    [
      'int', 'integer', 'string'
    ].forEach(function (type) {
      (function () { types.unregister(type); }).should.throw('Cannot unregister primitive type `' + type + '`');
    });
  });

  it('should fail at unregistering invalid type', function () {
    [
      null, undefined, false, true, {}, []
    ].forEach(function (type) {
      (function () { types.unregister(type); }).should.throw('Type name must be a string `' + String(type) + '`');
    });

  });

  it('should fail at checking invalid type', function () {
    [
      null, undefined, false, true, {}, []
    ].forEach(function (type) {
      (function () { types.check(type); }).should.throw('Type name must be a string `' + String(type) + '`');
    });
  });

  it('should not fail at unregistering unknown types', function () {
    [
      function INVALID_TYPE() {}, '.', 'TestSomeInvalidType'
    ].forEach(function (type) {
      assert.equal(types.unregister(type), undefined);
    });
  });

  describe('Testing primitive : `int` / `integer`', function () {

    it('should not override', function () {
      types.isRegistered('int').should.be.true;
      types.isRegistered('integer').should.be.true;

      (function () { types.register('int'); }).should.throw();
      (function () { types.register('integer'); }).should.throw();
      (function () { types.register('int', function () {}); }).should.throw();
      (function () { types.register('integer', function () {}); }).should.throw();
    });

    it('should validate', function () {
      [
        -1, 0, 2, 100
      ].forEach(function (v) {
        types.check('int', v).should.be.a.Number.and.equal(v);
        types.check('integer', v).should.be.a.Number.and.equal(v);
      });

      [
        undefined, null
      ].forEach(function (v) {
        assert.equal(types.check('int', v), v);
        assert.equal(types.check('integer', v), v);
      });
    });

    it('should not validate', function () {
      [
        false, true, 0.1, 123.01, "", "1", {}, [], function () {}, 1/0, NaN
      ].forEach(function (v) {
        (function () { types.check('int', v); }).should.throw();
        (function () { types.check('integer', v); }).should.throw();
      });
    });
  });

  describe('Testing primitive : `float` / `number`', function () {

    it('should validate', function () {
      types.isRegistered('float').should.be.true;
      types.isRegistered('number').should.be.true;
      types.isRegistered(Number).should.be.true;

      [
        -1, -1.01, 0.1, 1, 2.345, 100, 100.000000001
      ].forEach(function (v) {
        types.check('float', v).should.be.a.Number.and.equal(v);
        types.check('number', v).should.be.a.Number.and.equal(v);
        types.check(Number, v).should.be.a.Number.and.equal(v);
      });

      [
        undefined, null
      ].forEach(function (v) {
        assert.equal(types.check('float', v), v);
        assert.equal(types.check('number', v), v);
        assert.equal(types.check(Number, v), v);
      });
    });

    it('should not validate', function () {
      [
        false, true, "", "1", {}, [], function () {}, NaN
      ].forEach(function (v) {
        (function () { types.check('float', v); }).should.throw();
        (function () { types.check('number', v); }).should.throw();
        (function () { types.check(Number, v); }).should.throw();
      });
    });
  });

  describe('Testing primitive : `string` / `text`', function () {

    it('should validate', function () {
      types.isRegistered('text').should.be.true;
      types.isRegistered('String').should.be.true;
      types.isRegistered(String).should.be.true;

      [
        "", "foo"
      ].forEach(function (v) {
        types.check('text', v).should.be.a.String.and.equal(v);
        types.check('string', v).should.be.a.String.and.equal(v);
        types.check(String, v).should.be.a.String.and.equal(v);
      });

      // convert numbers
      [
        -1234, -123.456, 123.456, 1234
      ].forEach(function (v) {
        types.check('text', v).should.be.a.String.and.equal(String(v));
        types.check('string', v).should.be.a.String.and.equal(String(v));
        types.check(String, v).should.be.a.String.and.equal(String(v));
      });

      [
        undefined, null
      ].forEach(function (v) {
        assert.equal(types.check('text', v), v);
        assert.equal(types.check('string', v), v);
        assert.equal(types.check(String, v), v);
      });
    });

    it('should not validate', function () {
      [
        false, true, {}, [], function () {}
      ].forEach(function (v) {
        (function () { types.check('text', v); }).should.throw();
        (function () { types.check('string', v); }).should.throw();
        (function () { types.check(String, v); }).should.throw();
      });
    });
  });

  describe('Testing primitive : `bool` / `boolean`', function () {

    it('should validate', function () {
      types.isRegistered('bool').should.be.true;
      types.isRegistered('boolean').should.be.true;
      types.isRegistered(Boolean).should.be.true;


      [
        -1, 0, 1, false, true
      ].forEach(function (v) {
        types.check('bool', v).should.be.a.Boolean.and.equal(Boolean(v));
        types.check('boolean', v).should.be.a.Boolean.and.equal(Boolean(v));
        types.check(Boolean, v).should.be.a.Boolean.and.equal(Boolean(v));
      });

      [
        undefined, null
      ].forEach(function (v) {
        assert.equal(types.check('bool', v), v);
        assert.equal(types.check('boolean', v), v);
        assert.equal(types.check(Boolean, v), v);
      });
    });

    it('should not validate', function () {
      [
        "", "1", {}, [], function () {}
      ].forEach(function (v) {
        (function () { types.check('bool', v); }).should.throw();
        (function () { types.check('boolean', v); }).should.throw();
        (function () { types.check(Boolean, v); }).should.throw();
      });
    });
  });

  describe('Testing primitive : `array`', function () {

    it('should validate', function () {
      types.isRegistered('array').should.be.true;
      types.isRegistered(Array).should.be.true;

      [
        [], [1, 2], [null], [false], [true], new Array(3)
      ].forEach(function (v) {
        types.check('array', v).should.be.an.Array.and.equal(v);
        types.check(Array, v).should.be.an.Array.and.equal(v);
      });

      [
        undefined, null
      ].forEach(function (v) {
        assert.equal(types.check('array', v), v);
        assert.equal(types.check(Array, v), v);
      });
    });

    it('should not validate', function () {
      [
        false, true, 0, 0.1, 1, 123, 123.01, "", "1", {}, function () {}
      ].forEach(function (v) {
        (function () { types.check('array', v); }).should.throw();
        (function () { types.check(Array, v); }).should.throw();
      });
    });
  });

  describe('Testing primitive : `object`', function () {

    it('should validate', function () {
      types.isRegistered('object').should.be.true;
      types.isRegistered(Object).should.be.true;

      [
        {}, { foo: 'bar' }, new Object(), Object.create(null)
      ].forEach(function (v) {
        assert.equal(types.check('object', v), v);
        assert.equal(types.check(Object, v), v);
      });

      [
        undefined, null
      ].forEach(function (v) {
        assert.equal(types.check('object', v), v);
        assert.equal(types.check(Object, v), v);
      });
    });

    it('should not validate', function () {
      [
        false, true, 0, 0.1, 1, 123, 123.01, "", "1", [], function () {}
      ].forEach(function (v) {
        (function () { types.check('object', v); }).should.throw();
        (function () { types.check(Object, v); }).should.throw();
      });
    });
  });

  describe('Testing custom types', function () {

    it('should validate custom validator', function () {
      [
        'foo', 'FooInvalid', '_', '$'
      ].forEach(function (typeName) {
        var Type;

        (function () { types.check(typeName); }).should.throw();

        Type = types.register(typeName, function (v) {
          if (v === typeName) {
            return v;
          }
          throw "Test failed!";
        });

        types.isRegistered(typeName).should.be.true;

        types.check(typeName, typeName).should.equal(typeName);
        (function () { types.check(typeName); }).should.throw();
        (function () { types.check(typeName, typeName + '!!!!'); }).should.throw();

        types.unregister(typeName).should.be.a.Function;
        (function () { types.check(typeName, typeName); }).should.throw();
      });
    });

    it('should validate custom Type', function () {
      var FooCustomType = function FooCustomType() {};
      var foo = new FooCustomType();

      (function () { types.check('FooCustomType'); }).should.throw();

      types.register(FooCustomType);

      types.isRegistered('FooCustomType').should.be.true;
      types.isRegistered(FooCustomType).should.be.true;

      types.check('FooCustomType', foo).should.equal(foo);
      types.check(FooCustomType, foo).should.equal(foo);
      assert.equal(types.check('FooCustomType', undefined), undefined);
      assert.equal(types.check('FooCustomType', null), null);
      assert.equal(types.check(FooCustomType, null), null);
      (function () { types.check('FooCustomType', 'bar'); }).should.throw();

      types.getRegisteredNames().indexOf('FooCustomType').should.be.greaterThan(-1);

      types.unregister(FooCustomType).should.be.a.Function;
      (function () { types.check('FooCustomType'); }).should.throw();
    });

    it('should validate inheritance', function () {
      var Foo = function Foo() {};
      var Bar = function Bar() {};
      util.inherits(Bar, Foo);

      types.register(Foo);

      types.check(Foo.name, new Bar()).should.be.an.Object;
    });

    it('should not validate', function () {
      var Foo = function Foo() {};
      var Bar = function Bar() {};

      types.register(Foo);

      types.check(Foo, new Foo()).should.be.an.Object;
      types.check(Foo.name, new Foo()).should.be.an.Object;

      [
        1, "", {}, [], true, false, function () {}, new Bar()
      ].forEach(function (val) {
        (function () { types.check(Foo.name, val); }).should.throw();
      });
    });
  });

});
