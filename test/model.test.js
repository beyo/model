'use strict';


describe('Testing Model', function () {

  const Model = require('../lib/model');

  describe('Defining models', function () {

    it('should not create instance if not defined', function () {

      class TestModel extends Model {}

      (function () { new TestModel(); }).should.throw('Undefined Model instance');
    });

    it('should be instanceof Model', function () {

      class TestModel_0 extends Model {}

      Model.define(TestModel_0);

      let t = new TestModel_0();

      t.should.instanceOf(TestModel_0);
      t.should.instanceOf(Model);
    });

    it('should allow models with no defined attributes', function () {

      class TestModel_1 extends Model {}

      Model.define(TestModel_1);

      let t = new TestModel_1();

      t.toJson().should.deepEqual({});
    });

    it('should create from attributes', function () {

      class TestModel_2 extends Model {}

      Model.define(TestModel_2, {
        foo: {
          default: 'Foo'
        }
      });

      let t = new TestModel_2();

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

      class TestModel_A extends Model {}

      Model.isDefined(TestModel_A).should.be.false();
      Model.isDefined(TestModel_A.name).should.be.false();
      Model.define(TestModel_A);
      Model.isDefined(TestModel_A).should.be.true();
      Model.isDefined(TestModel_A.name).should.be.true();
      Model.undefine(TestModel_A.name).should.equal(TestModel_A);
      Model.isDefined(TestModel_A).should.be.false();
      Model.isDefined(TestModel_A.name).should.be.false();
      Model.define(TestModel_A);
      Model.undefine(TestModel_A).should.equal(TestModel_A);
      Model.isDefined(TestModel_A).should.be.false();
      Model.isDefined(TestModel_A.name).should.be.false();

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
      Model.isDefined('TestModel_A').should.be.false();
      (function () { Model.undefine('TestModel_A'); }).should.throw('Unknown model name');
    });

  });


  describe('Getting models', function () {

    it('should get defined models', function () {

      class TestModel_3 extends Model {}

      Model.isDefined(TestModel_3.name).should.be.false();
      Model.define(TestModel_3);

      Model.isDefined(TestModel_3.name).should.be.true();
      Model.get(TestModel_3.name).should.equal(TestModel_3);
    });

    it('should get named defined models', function () {
      const modelName = 'NamedModel_4';

      class TestModel_4 extends Model {}

      Model.define(modelName, TestModel_4);

      Model.get(modelName).should.equal(TestModel_4);
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