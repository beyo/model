/**
Integer validation
*/
'use strict';

describe('Test Type Integer', function () {

  const validator = require('../../lib/types/integer');


  it('should validate', function () {
    [
      -Infinity, Infinity,
      -1, 0, 1
    ].forEach(function (value) {
      (value === validator(value)).should.be.true();
    });
  });

  it('should validate with transform', function () {
    [
      '-Infinity', 'Infinity',
      '-1', '0', '1'
    ].forEach(function (value) {
      validator(value).should.equal(parseFloat(value, 10));
    });
  });

  it('should throw', function () {
    [
      undefined, null,
      -0.0001, 0.0001, 123.456, '123.456', '-123.456',
      NaN,
      '', 'foo',
      function () {}, {}, /./,
      [], new Array(), new Date()
    ].forEach(function (value) {
      (function () { validator(value); }).should.throw(/Invalid integer/);
    });
  });

});