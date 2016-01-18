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
        (function () { Model.get(name); }).should.throw('Invalid model name');
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


});