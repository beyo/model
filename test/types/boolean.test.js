/**
Boolean validation
*/
'use strict';

describe('Test Type Boolean', function () {

  const validator = require('../../lib/types/boolean');


  it('should validate', function () {
    [
      true, false
    ].forEach(function (value) {
      (value === validator(value)).should.be.true();
    });
  });

  it('should validate with transform', function () {
    const tests = {
      'true': true,
      'TRUE': true,
      'True': true,
      '1': true,
      'false': false,
      'FALSE': false,
      'False': false,
      '0': false
    };

    Object.keys(tests).forEach(function (value) {
      validator(value).should.equal(tests[value]);
    });

    [
      -1, 1, Infinity
    ].forEach(function (n) {
      validator(n).should.be.true();
    });

    [
      0, NaN
    ].forEach(function (n) {
      validator(n).should.be.false();
    });
  });

  it('should throw', function () {
    [
      undefined, null,
      '', 'foo',
      function () {}, {}, /./, new Date(),
      [], new Array()
    ].forEach(function (value) {
      (function () { validator(value); }).should.throw(/Invalid boolean/);
    });
  });

});