
var types = require('../../lib/types');

var util = require('util');

describe('Test Types', function () {

  it('should not allow defining invalid types', function () {
    [
      undefined, null, false, true, '', '\n', ' ', '*', '1', -1, 0, 1, {}, [],
    ].forEach(function (invalidType) {
      (function () { types.define(invalidType, function () {}); }).should.throw();
    });
  });

  it('should fail at undefining primitives', function () {
    [
      'int', 'integer', 'string'
    ].forEach(function (type) {
      (function () { types.undefine(type); }).should.throw('Cannot undefine primitive type `' + type + '`');
    });
  });

  it('should fail at undefining invalid type', function () {
    [
      null, undefined, false, true, {}, []
    ].forEach(function (type) {
      (function () { types.undefine(type); }).should.throw('Type name must be a string `' + String(type) + '`');
    });

  });

  it('should fail at checking invalid type', function () {
    [
      null, undefined, false, true, {}, []
    ].forEach(function (type) {
      (function () { types.check(type); }).should.throw('Type name must be a string `' + String(type) + '`');
    });
  });

  it('should not fail at undefining unknown types', function () {
    [
      function INVALID_TYPE() {}, 'a.b', 'TestSomeInvalidType'
    ].forEach(function (type) {
      types.undefine(type).should.be.false;
    });
  });

  describe('Testing primitive : `int` / `integer`', function () {

    it('should not override', function () {
      types.isDefined('int').should.be.true;
      types.isDefined('integer').should.be.true;

      (function () { types.define('int'); }).should.throw();
      (function () { types.define('integer'); }).should.throw();
      (function () { types.define('int', function () {}); }).should.throw();
      (function () { types.define('integer', function () {}); }).should.throw();
    });

    it('should validate', function () {
      [
        -1, 0, 2, 100, '0', '123'
      ].forEach(function (v) {
        types.check('int', v).should.be.a.Number.and.equal(parseInt(v));
        types.check('integer', v).should.be.a.Number.and.equal(parseInt(v));
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
        false, true, 0.1, 123.01, '', '123.456', {}, [], function () {}, 1/0, NaN
      ].forEach(function (v) {
        (function () { types.check('int', v); }).should.throw();
        (function () { types.check('integer', v); }).should.throw();
      });
    });
  });

  describe('Testing primitive : `float` / `number`', function () {

    it('should validate', function () {
      types.isDefined('float').should.be.true;
      types.isDefined('number').should.be.true;
      types.isDefined(Number).should.be.true;

      [
        -1, -1.01, 0.1, 1, 2.345, 100, 100.000000001, '1', '123.456'
      ].forEach(function (v) {
        types.check('float', v).should.be.a.Number.and.equal(parseFloat(v));
        types.check('number', v).should.be.a.Number.and.equal(parseFloat(v));
        types.check(Number, v).should.be.a.Number.and.equal(parseFloat(v));
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
        false, true, "", {}, [], function () {}, NaN
      ].forEach(function (v) {
        (function () { types.check('float', v); }).should.throw();
        (function () { types.check('number', v); }).should.throw();
        (function () { types.check(Number, v); }).should.throw();
      });
    });
  });

  describe('Testing primitive : `string` / `text`', function () {

    it('should validate', function () {
      types.isDefined('text').should.be.true;
      types.isDefined('String').should.be.true;
      types.isDefined(String).should.be.true;

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
      types.isDefined('bool').should.be.true;
      types.isDefined('boolean').should.be.true;
      types.isDefined(Boolean).should.be.true;


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
      types.isDefined('array').should.be.true;
      types.isDefined(Array).should.be.true;

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
      types.isDefined('object').should.be.true;
      types.isDefined(Object).should.be.true;

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

        Type = types.define(typeName, function (v) {
          if (v === typeName) {
            return v;
          }
          throw "Test failed!";
        });

        types.isDefined(typeName).should.be.true;

        types.check(typeName, typeName).should.equal(typeName);
        (function () { types.check(typeName); }).should.throw();
        (function () { types.check(typeName, typeName + '!!!!'); }).should.throw();

        types.undefine(typeName).should.be.a.Function;
        (function () { types.check(typeName, typeName); }).should.throw();
      });
    });
    it('should fail defining custom validator', function () {
      var typeName = 'customValidatorTestType';
      var validator1 = function (v) { return v; };
      var validator2 = function (v) { return v; };
      var Type;

      Type = types.define(typeName, validator1);
      Type = types.define(typeName, validator1);

      +function() { types.define(typeName, validator2); }.should.throw();
    });

    it('should validate custom Type', function () {
      var FooCustomType = function FooCustomType() {};
      var foo = new FooCustomType();

      (function () { types.check('FooCustomType'); }).should.throw();

      types.define(FooCustomType);

      types.isDefined('FooCustomType').should.be.true;
      types.isDefined(FooCustomType).should.be.true;

      types.check('FooCustomType', foo).should.equal(foo);
      types.check(FooCustomType, foo).should.equal(foo);
      assert.equal(types.check('FooCustomType', undefined), undefined);
      assert.equal(types.check('FooCustomType', null), null);
      assert.equal(types.check(FooCustomType, null), null);
      (function () { types.check('FooCustomType', 'bar'); }).should.throw();

      types.getDefinedNames().indexOf('FooCustomType').should.be.greaterThan(-1);

      types.undefine(FooCustomType).should.be.a.Function;
      (function () { types.check('FooCustomType'); }).should.throw();
    });

    it('should validate inheritance', function () {
      var Foo = function Foo() {};
      var Bar = function Bar() {};
      util.inherits(Bar, Foo);

      types.define(Foo);

      types.check(Foo.name, new Bar()).should.be.an.Object;

      types.undefine(Foo); // make sure this is undefined
    });

    it('should not validate', function () {
      var Foo = function Foo() {};
      var Bar = function Bar() {};

      types.define(Foo);

      types.check(Foo, new Foo()).should.be.an.Object;
      types.check(Foo.name, new Foo()).should.be.an.Object;

      [
        1, "", {}, [], true, false, function () {}, new Bar()
      ].forEach(function (val) {
        (function () { types.check(Foo.name, val); }).should.throw();
      });
    });
  });

  describe('Test array types', function () {

    it('should validate simple arrays', function () {
      types.check('int[3][][19]');

      types.check('int[3][][19]', [ [ [ 1, 2, 3 ] ] ]);

      types.check('string[]', [ 'foo', 'bar' ]);

    });

    it('should not validate simple arrays', function () {
      +function () { types.check('int[3]foo', [ [ 1, 2 ] ]); }.should.throw();
      +function () { types.check('int[3][][19]', [ [ 1, 2, 3 ] ]); }.should.throw();
      +function () { types.check('int[3][][19]', [ [ [ "abc", "def" ] ] ]); }.should.throw();
    });

  });

});
