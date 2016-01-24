'use strict';


describe('Testing Types', function () {

  const Type = require('../lib/types');


  describe('Parsing', function () {

    it('should parse simple type', function () {
      [
        'foo',
        'FOO',
        'Foo',
        function foo() {},
        function FOO() {},
        function Foo() {}
      ].forEach(function (t) {
        Type.parseType(t).should.deepEqual({ name: 'foo', isArray: false });
      });
    });

    it('should parse namespace type', function () {
      [
        'foo.bar.buz',
        'FOO.BAR.BUZ',
        'Foo.Bar.Buz',
        function foo_bar_buz() {},
        function FOO_BAR_BUZ() {},
        function Foo_Bar_Buz() {}
      ].forEach(function (t) {
        Type.parseType(t).should.deepEqual({ name: 'foo.bar.buz', isArray: false });
      });
    });

    it('should fail if not a string or function', function () {
      [
        undefined, null,
        Infinity, NaN, -1, 0, 1, false, true,
        {}, Object.create(null),
        [], new Array(), /./, new Date()
      ].forEach(function (type) {
        (function () { Type.parseType(type); }).should.throw(/Type name must be a string/);
      });
    });

    it('should fail on invalid name', function () {
      [
        '',
        '\n', 'foo\nbar',
        '-', 'foo-bar',
        '0', '1', '0foo', '1foo'
      ].forEach(function (type) {
        console.log(type);
        (function () { Type.parseType(type); }).should.throw(/Invalid type/);
      });
    });

  });



  describe('Validate types', function () {

    it('should check valid types');

    it('should check valid arrays');

    it('should fail invalid types');

    it('should fail invalid arrays');

  })


  describe('Defining types', function () {

    it('should define type');

    it('should define type by name');

    it('should define type (as array)');

    it('should fail to override primitive');

    it('should fail to override defined type');

  });


  describe('Undefining types', function () {

    it('should undefine type');

    it('should undefine type (as array)');

    it('should fail undefining primitive');

  });


  describe('Validate values', function () {

    it('should validate primitive');

    it('should validate array of primitives');

    it('should validate defined type');

    it('should validate array of defined type');

    it('should fail when invalid primitive');

    it('should fail when invalid primitive in array');

    it('should fail when invalid defined type');

    it('should fail when invalid defined type in array');

  });

});