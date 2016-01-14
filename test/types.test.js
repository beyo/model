'use strict';


describe('Testing Types', function () {

  const Model = require('../lib/types');


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