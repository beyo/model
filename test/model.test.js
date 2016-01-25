'use strict';


describe('Testing Model', function () {

  const Model = require('../lib/model');

  describe('Defining models', function () {

    it('should not create instance if not defined', function () {

      class TestModel extends Model {}

      (function () { new TestModel(); }).should.throw('Undefined Model instance');
    });

    it('should be instanceof Model', function () {

      class TestModel0 extends Model {}

      Model.define(TestModel0);

      let t = new TestModel0();

      t.should.instanceOf(TestModel0);
      t.should.instanceOf(Model);
    });

    it('should allow models with no defined attributes', function () {

      class TestModel1 extends Model {}

      Model.define(TestModel1);

      let t = new TestModel1();

      t.toJson().should.deepEqual({});
    });

    it('should create from attributes', function () {

      class TestModel2 extends Model {}

      Model.define(TestModel2, {
        foo: {
          default: 'Foo'
        }
      });

      let t = new TestModel2();

      t.foo.should.equal('Foo');
      t.toJson().should.deepEqual({ foo: 'Foo' });
    });

    it('should fail with wrong model', function () {
      [
        undefined, null, false, true,
        NaN, 0, 1, Infinity, '', 'foo',
        function () {}, {}, [], /./, new Date()
      ].forEach(function (model) {
        (function () { Model.define(model); }).should.throw('Invalid model');
        (function () { Model.define('InvalidModel', model); }).should.throw('Invalid model');
        (function () { Model.define('InvalidModel', model, {}); }).should.throw('Invalid model');
      });
    });

  });


  describe('Undefining models', function () {

    it('should undefine models', function () {

      class TestModelA extends Model {}

      Model.isDefined(TestModelA).should.be.false();
      Model.isDefined(TestModelA.name).should.be.false();
      Model.define(TestModelA);
      Model.isDefined(TestModelA).should.be.true();
      Model.isDefined(TestModelA.name).should.be.true();
      Model.undefine(TestModelA.name).should.equal(TestModelA);
      Model.isDefined(TestModelA).should.be.false();
      Model.isDefined(TestModelA.name).should.be.false();
      Model.define(TestModelA);
      Model.undefine(TestModelA).should.equal(TestModelA);
      Model.isDefined(TestModelA).should.be.false();
      Model.isDefined(TestModelA.name).should.be.false();

    });

    it('should fail if invalid model name', function () {
      [
        undefined, null, false, true,
        NaN, 0, 1, Infinity, '',
        function () {}, {}, [], /./, new Date()
      ].forEach(function (name) {
        (function () { Model.undefine(name); }).should.throw(/Type name must be a string|Invalid type/);
      });
    });

    it('should fail on missing model', function () {
      Model.isDefined('TestModelA').should.be.false();
      (function () { Model.undefine('TestModelA'); }).should.throw('Unknown model name');
    });

  });


  describe('Getting models', function () {

    it('should get defined models', function () {

      class TestModel3 extends Model {}

      Model.isDefined(TestModel3.name).should.be.false();
      Model.define(TestModel3);

      Model.isDefined(TestModel3.name).should.be.true();
      Model.get(TestModel3.name).should.equal(TestModel3);
    });

    it('should get named defined models', function () {
      const modelName = 'NamedModel_4';

      class TestModel4 extends Model {}

      Model.define(modelName, TestModel4);

      Model.get(modelName).should.equal(TestModel4);
    });

    it('should fail with invalid model name', function () {
      [
        undefined, null, false, true,
        NaN, 0, 1, '',
        function () {}, {}, [], /./, new Date()
      ].forEach(function (name) {
        (function () { Model.get(name); }).should.throw(/Type name must be a string|Invalid type/);
      });
    });

    it('should fail on unknown model', function () {
      [
        'InvalidModel'
      ].forEach(function (name) {
        (function () { Model.get(name); }).should.throw('Unknown model name');
      });
    });

  });


  describe('Primary attributes', function () {

    it('should return defined primary attributes', function () {

      class TestPrimary extends Model {}

      Model.define(TestPrimary, {
        foo: { primary: true },
        bar: { primary: false },
        buz: { primary: true },
        meh: {}
      });

      Model.getPrimaryAttributes(TestPrimary).should.deepEqual(['foo', 'buz']);
      Model.getPrimaryAttributes('TestPrimary').should.deepEqual(['foo', 'buz']);
    });

    it('should fail on unknown model', function () {

      Model.isDefined('UnknownPrimaryModel').should.be.false();

      (function () { Model.getPrimaryAttributes('UnknownPrimaryModel'); }).should.throw('Unknown model name');
    });

  });


  describe('JSON', function () {

    class JsonModel1 extends Model {}
    class JsonModel2 extends Model {}

    before(function () {
      const JsonModel1Attributes = {
        optional: 'JsonModel2',
        mandatory: {
          type: 'JsonModel2',
          get default() { return new JsonModel2(); }
        },
        special: {
          type: 'text',
          alias: 'bob'
        }
      };
      const JsonModel2Attributes = {
        foo: {
          type: 'text',
          default: 'Hello'
        }
      };

      Model.define(JsonModel1, JsonModel1Attributes);
      Model.define(JsonModel2, JsonModel2Attributes);
    });


    it('should import from JSON', function () {
      let model = new JsonModel1({
        optional: { foo: 'World' }
      });

      model.optional.foo.should.equal('World');

      model.toJson().should.deepEqual({ optional: { foo: 'World' }, mandatory: { foo: 'Hello' }});
    });

    it('should import with alias', function () {
      let model = new JsonModel1({
        bob: 'Is special'
      });

      model.toJson().should.deepEqual({ mandatory: { foo: 'Hello' }, special: 'Is special' });
    });

    it('should export to JSON', function () {
      let model = new JsonModel1();

      model.toJson().should.deepEqual({ mandatory: { foo: 'Hello' }});
    });

  });


  describe('Events', function () {

    it('should emit update events', function () {

    });

  });


});