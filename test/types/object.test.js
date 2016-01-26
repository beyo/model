/**
Object validation
*/
'use strict';

describe('Test Type Object', function () {

  const validator = require('../../lib/types/object');


  it('should validate', function () {
    [
      {}, Object.create(null)
    ].forEach(function (value) {
      (value === validator(value)).should.be.true();
    });
  });

  it('should throw', function () {
    [
      undefined, null,
      -1, 0, 1, Infinity, NaN,
      true, false,
      '', 'foo',
      function () {}, /./, new Date(),
      [], new Array()
    ].forEach(function (value) {
      (function () { validator(value); }).should.throw(/Invalid object/);
    });
  });

});