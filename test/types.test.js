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
        (function () { Type.parseType(type); }).should.throw(/Invalid type/);
      });
    });

  });



  describe('Validate types', function () {
    const validTypes = [
      'foo', 'foo.bar', 'foo_bar',
      function foo() {}, function foo_bar() {}
    ];
    const invalidTypes = [
      '', 'foo\nbar',
      function () {}
    ];

    it('should check valid types', function () {
      validTypes.forEach(function (type) {
        Type.isValidType(type).should.be.true();
      });
    });

    it('should check valid arrays', function () {
      validTypes.forEach(function (type) {
        if (typeof type === 'string') {
          Type.isValidType(type + '[]').should.be.true();
        }
      });
    });

    it('should fail invalid types', function () {
      invalidTypes.forEach(function (type) {
        Type.isValidType(type).should.be.false();
      });
    });

    it('should fail invalid arrays', function () {
      invalidTypes.forEach(function (type) {
        if (typeof type === 'string') {
          Type.isValidType(type + '[]').should.be.false();
        }
      });
    });

  })


  describe('Defining types', function () {

    it('should define type', function () {
      function testType(value) { return value; };

      Type.define(testType).should.be.instanceOf(Function);
      Type.getDefinedNames().some(function (name) { return name === testType.name.toLocaleLowerCase(); }).should.be.true();
    });

    it('should define type with validator', function () {
      function testTypeWithValidator(value) { return value; };
      function testValidator() {};

      Type.define(testTypeWithValidator, testValidator).should.equal(testValidator);
      Type.getDefinedNames().some(function (name) { return name === testTypeWithValidator.name.toLocaleLowerCase(); }).should.be.true();
    });

    it('should define type by name', function () {
      function testType(value) { return value; };
      function testValidator() {};

      Type.define('testAlias', testType).should.be.instanceOf(Function);
      Type.getDefinedNames().some(function (name) { return name === 'testalias'; }).should.be.true();

      Type.define('testAliasWithValidator', testType, testValidator).should.equal(testValidator);
      Type.getDefinedNames().some(function (name) { return name === 'testaliaswithvalidator'; }).should.be.true();
    });

    it('should fail if type name is not a string', function () {
      [
        undefined, null, false, true,
        -1, 0, 1, NaN, Infinity,
        {}, Object.create(null), [], new Date(), /./
      ].forEach(function (type) {
        (function () { Type.define(type); }).should.throw(/Invalid type name/);
      });
    });

    it('should fail if type is not a function', function () {
      [
        undefined, null, false, true,
        -1, 0, 1, NaN, Infinity,
        {}, Object.create(null), [], new Date(), /./
      ].forEach(function (type) {
        (function () { Type.define('testTypeNotAFunction', type); }).should.throw(/Invalid type/);
      });
    });

    it('should fail if validator is not a function', function () {
      [
        null, false, true,
        -1, 0, 1, NaN, Infinity,
        {}, Object.create(null), [], new Date(), /./
      ].forEach(function (validator) {
        (function () { Type.define('testValidatorNotAFunction', function () {}, validator); }).should.throw(/Invalid or missing validator/);
      });
    });

    it('should fail if define type is array', function () {
      (function () { Type.define('testArray[]', function () {}); }).should.throw(/Cannot define array type/);
    });

    it('should fail to override primitive', function () {
      [
        'int',
        'integer',
        'float',
        'number',
        'text',
        'string',
        'bool',
        'boolean',
        'date',
        'array',
        'object'
      ].forEach(function (name) {
        (function () { Type.define(name, function () {}); }).should.throw(/Cannot override primitive type/);
      });
    });

    it('should fail to override defined type', function () {
      Type.isDefined('testTypeOverride').should.be.false();
      Type.define(function testTypeOverride() {});
      Type.isDefined('testTypeOverride').should.be.true();

      (function () { Type.define('testTypeOverride', function () {}); }).should.throw(/Cannot override defined type/);
      (function () { Type.define('testTypeOverride', function () {}, function () {}); }).should.throw(/Cannot override defined type/);
    });

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

    it('should validate with default validator');

    it('should validate array of defined type');

    it('should validate array with default validator');

    it('should fail when invalid primitive');

    it('should fail when invalid primitive in array');

    it('should fail when invalid defined type');

    it('should fail when invalid defined type in array');

  });

});