'use strict';


describe('Testing Types', function () {

  const Type = require('../lib/types');

  const PRIMITIVE = [
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
  ];


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
      PRIMITIVE.forEach(function (name) {
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

    it('should undefine type', function () {
      class TestUndefineClass {}
      function TestUndefineFn() {}
      function validator() {}

      Type.isDefined('TestUndefineClass').should.be.false();
      Type.define(TestUndefineClass, validator);
      Type.isDefined('TestUndefineClass').should.be.true();
      Type.undefine(TestUndefineClass).should.equal(validator);
      Type.isDefined('TestUndefineClass').should.be.false();

      Type.define(TestUndefineFn, validator);
      Type.isDefined('TestUndefineFn').should.be.true();
      Type.undefine('TestUndefineFn').should.equal(validator);
      Type.isDefined('TestUndefineFn').should.be.false();
    });

    it('should skip if type not defined', function () {
      Type.isDefined('testUndefine').should.be.false();
      Type.undefine('testUndefine').should.be.false();
      Type.isDefined('testUndefine').should.be.false();
    });

    it('should faile undefining type (as array)', function () {
      (function () { Type.undefine('testUndefine[]'); }).should.throw(/Cannot undefine array type/);
    });

    it('should fail undefining primitive', function () {
      PRIMITIVE.forEach(function (type) {
        (function () { Type.undefine(type); }).should.throw(/Cannot undefine primitive type/);
      });
    });

  });


  describe('Validate values', function () {
    const PRIMITIVE_TESTS = {
      'int': [undefined, null, -Infinity, -1, 0, 1, Infinity, '0', '-Infinity', 'Infinity'],
      'integer': [undefined, null, -Infinity, -1, 0, 1, Infinity, '0', '-Infinity', 'Infinity'],
      'float': [undefined, null, -Infinity, -1.234, 0.123, 1.234, Infinity, '0.123', '-Infinity', 'Infinity'],
      'number': [undefined, null, -Infinity, -1.234, 0.123, 1.234, Infinity, '0.123', '-Infinity', 'Infinity'],
      'text': [undefined, null, '', 'Hello'],
      'string': [undefined, null, '', 'Hello'],
      'bool': [undefined, null, false, true, 0, 1, '0', '1', 'True', 'False'],
      'boolean': [undefined, null, false, true, 0, 1, '0', '1', 'True', 'False'],
      'date': [undefined, null, new Date(), Date.now()],
      'array': [undefined, null, [], [0, 1, 2, 3]],
      'object': [undefined, null, {}]
    };

    it('should validate primitive', function () {
      Object.keys(PRIMITIVE_TESTS).forEach(function (type) {
        PRIMITIVE_TESTS[type].forEach(function (value) {
          Type.validate(type, value);
        });
      });
    });

    it('should validate if undefined or null', function () {
      Object.keys(PRIMITIVE_TESTS).forEach(function (type) {
        (undefined === Type.validate(type, undefined)).should.be.true();
        (null === Type.validate(type, null)).should.be.true();
      });
    })

    it('should validate array of primitives', function () {
      Object.keys(PRIMITIVE_TESTS).forEach(function (type) {
        Type.validate(type + '[]', PRIMITIVE_TESTS[type]);
      });
    });

    it('should validate defined type', function () {
      class TestValidateType {}
      function validator(v) { return v; }

      const value = new TestValidateType();

      Type.define(TestValidateType, validator);
      Type.validate('TestValidateType', value).should.equal(value);
    });

    it('should validate with default validator', function () {
      class TestDefaultValidateType {}

      const value = new TestDefaultValidateType();

      Type.define(TestDefaultValidateType);
      Type.validate('TestDefaultValidateType', value).should.equal(value);
    });

    it('should validate array of defined type', function () {
      class TestValidateArrayType {
        constructor(v) { this.value = v; }
      }
      function validator(v) { return v; }

      const value = [
        new TestValidateArrayType(1),
        new TestValidateArrayType(2)
      ];

      Type.define(TestValidateArrayType);
      Type.validate('TestValidateArrayType[]', value).should.equal(value);
    });

    it('should validate array with default validator', function () {
      class TestDefaultValidateArrayType {
        constructor(v) { this.value = v; }
      }

      const value = [
        new TestDefaultValidateArrayType(1),
        new TestDefaultValidateArrayType(2)
      ];

      Type.define(TestDefaultValidateArrayType);
      Type.validate('TestDefaultValidateArrayType[]', value).should.equal(value);
    });

    it('should fail when undefined type', function () {
      (function () { Type.validate('missingType', {}); }).should.throw(/Unknown type/);
    });

    it('should fail when undefined type as array', function () {
      (function () { Type.validate('missingType[]', []); }).should.throw(/Unknown type/);
    });

    it('should fail when validating array with non array value', function () {
      Object.keys(PRIMITIVE_TESTS).forEach(function (type) {
        (function () { Type.validate(type + '[]', {}); }).should.throw(/Value is not an array for type/);
      });
    });

    it('should fail with wrong type using default validator', function () {
      class TestWrongType {}

      Type.define(TestWrongType);

      (function () { Type.validate(TestWrongType, {}); }).should.throw(/Invalid TestWrongType/);
    });

  });

});