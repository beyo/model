'use strict';


describe('Testing Model', function () {

  const Model = require('../lib/model');


  describe('Defining models', function () {

    it('should not create instance if not defined', function () {

      class TestModel extends Model {}

      (function () { new TestModel(); }).should.throw('Undefined Model instance');
    });

    it('should be instanceof Model');

    it('should allow models with no defined attributes', function () {

      class TestModel extends Model {}

      Model.define(TestModel);

      let t = new TestModel();

      t.toJson().should.deepEqual({});
    });

  });


});