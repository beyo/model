
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


  describe('Testing primitive : `int` / `integer`', function () {

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

});
