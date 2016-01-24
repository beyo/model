/**
Array validation
*/
'use strict';

describe('Test Type Array', function () {

  const validator = require('../../lib/types/array');


  it('should validate', function () {
    [
      undefined, null,
      [], new Array()
    ].forEach(function (value) {
      (value === validator(value)).should.be.true();
    });
  });

  it('should throw', function () {
    [
      -1, 0, 1, Infinity, NaN,
      true, false,
      '', 'foo',
      function () {}, {}, /./, new Date()
    ].forEach(function (value) {
      (function () { validator(value); }).should.throw(/Invalid array/);
    });
  });

});