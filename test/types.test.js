
var types = require('../lib/types');

describe('Types test', function () {

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

  describe('Testing primitive : `int` / `integer`', function () {

    it('should not override', function () {
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
        false, true, 0.1, 123.01, "", "1", {}, [], function () {}
      ].forEach(function (v) {
        (function () { types.check('int', v); }).should.throw();
        (function () { types.check('integer', v); }).should.throw();
      });
    });
  });

  describe('Testing primitive : `float` / `number`', function () {

    it('should validate', function () {
      [
        -1, -1.01, 0.1, 1, 2.345, 100, 100.000000001
      ].forEach(function (v) {
        types.check('float', v).should.be.a.Number.and.equal(v);
        types.check('number', v).should.be.a.Number.and.equal(v);
      });

      [
        undefined, null
      ].forEach(function (v) {
        assert.equal(types.check('float', v), v);
        assert.equal(types.check('number', v), v);
      });
    });

    it('should not validate', function () {
      [
        false, true, "", "1", {}, [], function () {}
      ].forEach(function (v) {
        (function () { types.check('float', v); }).should.throw();
        (function () { types.check('number', v); }).should.throw();
      });
    });
  });

  describe('Testing primitive : `string` / `text`', function () {

    it('should validate', function () {
      [
        "", "foo"
      ].forEach(function (v) {
        types.check('string', v).should.be.a.String.and.equal(v);
        types.check('text', v).should.be.a.String.and.equal(v);
      });

      [
        undefined, null
      ].forEach(function (v) {
        assert.equal(types.check('string', v), v);
        assert.equal(types.check('text', v), v);
      });
    });

    it('should not validate', function () {
      [
        false, true, {}, [], function () {}
      ].forEach(function (v) {
        (function () { types.check('string', v); }).should.throw();
        (function () { types.check('text', v); }).should.throw();
      });
    });
  });

  describe('Testing primitive : `bool` / `boolean`', function () {

    it('should validate', function () {
      [
        -1, 0, 1, false, true
      ].forEach(function (v) {
        types.check('bool', v).should.be.a.Boolean.and.equal(Boolean(v));
        types.check('boolean', v).should.be.a.Boolean.and.equal(Boolean(v));
      });

      [
        undefined, null
      ].forEach(function (v) {
        assert.equal(types.check('bool', v), v);
        assert.equal(types.check('boolean', v), v);
      });
    });

    it('should not validate', function () {
      [
        "", "1", {}, [], function () {}
      ].forEach(function (v) {
        (function () { types.check('bool', v); }).should.throw();
        (function () { types.check('boolean', v); }).should.throw();
      });
    });
  });

  describe('Testing primitive : `array`', function () {

    it('should validate', function () {
      [
        [], [1, 2], [null], [false], [true], new Array(3)
      ].forEach(function (v) {
        types.check('array', v).should.be.an.Array.and.equal(v);
      });

      [
        undefined, null
      ].forEach(function (v) {
        assert.equal(types.check('array', v), v);
      });
    });

    it('should not validate', function () {
      [
        false, true, 0, 0.1, 1, 123, 123.01, "", "1", {}, function () {}
      ].forEach(function (v) {
        (function () { types.check('array', v); }).should.throw();
      });
    });
  });

  describe('Testing primitive : `object`', function () {

    it('should validate', function () {
      [
        {}, { foo: 'bar' }, new Object(), Object.create(null)
      ].forEach(function (v) {
        assert.equal(types.check('object', v), v);
      });

      [
        undefined, null
      ].forEach(function (v) {
        assert.equal(types.check('object', v), v);
      });
    });

    it('should not validate', function () {
      [
        false, true, 0, 0.1, 1, 123, 123.01, "", "1", [], function () {}
      ].forEach(function (v) {
        (function () { types.check('object', v); }).should.throw();
      });
    });
  });

  describe('Testing custom types', function () {

    it('should validate custom validator', function () {
      [
        'foo', 'Foo1', '_', '$'
      ].forEach(function (typeName) {
        (function () { types.check(typeName); }).should.throw();

        types.register(typeName, function (v) {
          if (v === typeName) {
            return v;
          }
          throw "Test";
        });

        types.check(typeName, typeName).should.equal(typeName);
        (function () { types.check(typeName); }).should.throw();
        (function () { types.check(typeName, typeName + '!!!!'); }).should.throw();

        types.unregister(typeName).should.be.a.Function;
        (function () { types.check(typeName); }).should.throw();
      });
    });

    it('should validate custom Type', function () {
      var Foo = function Foo() {};
      var foo = new Foo();

      (function () { types.check('Foo'); }).should.throw();

      types.register(Foo);

      types.check('Foo', foo).should.equal(foo);
      assert.equal(types.check('Foo', undefined), undefined);
      assert.equal(types.check('Foo', null), null);
      (function () { types.check('Foo', 'bar'); }).should.throw();

      types.unregister('Foo').should.be.a.Function;
      (function () { types.check('Foo'); }).should.throw();
    });

    it('should not validate');
  });

});
